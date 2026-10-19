import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  DEFAULT_CHAIN,
  DEFAULT_DAILY_LIMIT,
  MAX_CARDS,
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES,
  MAX_TOOL_RESULT_LENGTH,
  MAX_TOOL_ROUNDS,
  PLAIN_SYSTEM_PROMPT,
  PROVIDER_TIMEOUT_MS,
  PROVIDERS,
  SYSTEM_PROMPT,
  TOOLS,
  type ModelSpec,
} from "./config.ts";
import { availableModels, cooldownMs, parseSseLines, sanitizeMessages, ToolCallAccumulator, type ChatMessage, type ToolCall } from "./router.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-ai-remaining",
};

const embedder = new Supabase.ai.Session("gte-small");

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const loadChain = (): ModelSpec[] => {
  try {
    const raw = Deno.env.get("AI_CHAIN");
    return raw ? (JSON.parse(raw) as ModelSpec[]) : DEFAULT_CHAIN;
  } catch {
    return DEFAULT_CHAIN;
  }
};

class ProviderError extends Error {
  constructor(public status: number, public retryAfter: number | null) {
    super(`provider ${status}`);
  }
}

type Card = { id: number; name: string; [key: string]: unknown };

type Send = (event: string, data: unknown) => void;

const toolSpecs = TOOLS.map(({ name, description, parameters }) => ({ type: "function", function: { name, description, parameters } }));

const embedQuery = async (text: string) => {
  try {
    const vector = await embedder.run(text, { mean_pool: true, normalize: true });
    return Array.from(vector as number[]);
  } catch {
    return null;
  }
};

const runTool = async (db: SupabaseClient, call: ToolCall) => {
  const tool = TOOLS.find((candidate) => candidate.name === call.function.name);
  if (!tool) return { content: JSON.stringify({ error: "unknown_tool" }), cards: [] as Card[] };

  let args: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(call.function.arguments || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) args = parsed;
  } catch {
    return { content: JSON.stringify({ error: "invalid_arguments" }), cards: [] as Card[] };
  }

  delete args.embedding;
  if (tool.name === "search_games" && typeof args.query === "string" && args.query.trim()) {
    const embedding = await embedQuery(args.query.trim().slice(0, 200));
    if (embedding) args.embedding = embedding;
  }

  const { data, error } = await db.rpc(tool.rpc, { args });
  if (error) return { content: JSON.stringify({ error: "tool_failed" }), cards: [] as Card[] };

  const rows = (Array.isArray(data) ? data : []) as Card[];
  const content = JSON.stringify({ results: rows.map(({ cover: _cover, ...rest }) => rest) }).slice(0, MAX_TOOL_RESULT_LENGTH);
  return { content, cards: rows };
};

const callProvider = async (model: ModelSpec, messages: ChatMessage[], withTools: boolean) => {
  const provider = PROVIDERS[model.provider];
  const key = Deno.env.get(provider.keyEnv);
  if (!key) throw new ProviderError(401, null);

  const response = await fetch(provider.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model.id,
      messages,
      stream: true,
      ...(withTools ? { tools: toolSpecs, tool_choice: "auto" } : {}),
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new ProviderError(response.status, Number(response.headers.get("retry-after")) || null);
  }
  return response.body;
};

type RoundResult = { text: string; toolCalls: ToolCall[]; textSent: boolean };

const readRound = async (body: ReadableStream<Uint8Array>, send: Send): Promise<RoundResult> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const accumulator = new ToolCallAccumulator();
  let buffer = "";
  let text = "";
  let textSent = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { payloads, rest } = parseSseLines(buffer);
      buffer = rest;
      for (const payload of payloads) {
        if (payload === "[DONE]") continue;
        let chunk: { choices?: { delta?: { content?: string | null; tool_calls?: unknown[] } }[] };
        try {
          chunk = JSON.parse(payload);
        } catch {
          continue;
        }
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          text += delta.content;
          textSent = true;
          send("delta", { text: delta.content });
        }
        for (const toolCall of delta?.tool_calls ?? []) accumulator.add(toolCall as never);
      }
    }
  } catch (error) {
    if (textSent) throw Object.assign(new Error("stream_interrupted"), { textSent });
    throw error;
  }
  return { text, toolCalls: accumulator.result(), textSent };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authorization = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const userDb = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
  const { data: auth } = await userDb.auth.getUser();
  if (!auth.user) return json(401, { error: "unauthorized" });

  const body = await req.json().catch(() => ({}));
  const history = sanitizeMessages(body.messages, MAX_MESSAGES, MAX_MESSAGE_LENGTH);
  if (!history) return json(400, { error: "invalid_messages" });
  const withTools = body.mode !== "plain";

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const limit = Number(Deno.env.get("AI_DAILY_LIMIT")) || DEFAULT_DAILY_LIMIT;
  const { data: remaining } = await admin.rpc("ai_consume", { p_user: auth.user.id, p_limit: limit });
  if (remaining === null || remaining < 0) return json(429, { error: "limit", limit });

  const { data: health } = await admin.from("ai_model_health").select("model_id, cooldown_until");
  const cooldowns = new Map((health ?? []).map((row) => [row.model_id as string, Date.parse(row.cooldown_until as string)]));
  const candidates = availableModels(loadChain(), cooldowns, Date.now(), withTools);
  if (candidates.length === 0) {
    await admin.rpc("ai_refund", { p_user: auth.user.id });
    return json(503, { error: "unavailable" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const messages: ChatMessage[] = [{ role: "system", content: (withTools ? SYSTEM_PROMPT : PLAIN_SYSTEM_PROMPT)(today) }, ...history];
  const startedAt = Date.now();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send: Send = (event, data) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      const cards = new Map<number, Card>();
      let used: ModelSpec | undefined;

      const coolDown = (model: ModelSpec, error: ProviderError) =>
        admin.from("ai_model_health").upsert({
          model_id: model.id,
          cooldown_until: new Date(Date.now() + cooldownMs(error.status, error.retryAfter)).toISOString(),
          reason: String(error.status),
          updated_at: new Date().toISOString(),
        });

      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          const toolsAllowed = withTools && round < MAX_TOOL_ROUNDS;
          let result: RoundResult | undefined;

          for (const model of used ? [used, ...candidates.filter((candidate) => candidate.id !== used?.id)] : candidates) {
            try {
              const upstream = await callProvider(model, messages, toolsAllowed);
              send("model", { id: model.id, label: model.label, fallback: model.id !== candidates[0].id });
              used = model;
              result = await readRound(upstream, send);
              break;
            } catch (error) {
              if (error instanceof ProviderError) await coolDown(model, error);
              if ((error as { textSent?: boolean }).textSent) throw error;
              if (!(error instanceof ProviderError) && !(error instanceof DOMException) && !(error instanceof TypeError)) throw error;
            }
          }

          if (!result) throw new Error("unavailable");
          if (result.toolCalls.length === 0) break;

          messages.push({ role: "assistant", content: result.text || null, tool_calls: result.toolCalls });
          for (const call of result.toolCalls) {
            send("tool", { name: call.function.name, state: "running" });
            const outcome = await runTool(userDb, call);
            for (const card of outcome.cards) if (cards.size < MAX_CARDS && typeof card.id === "number") cards.set(card.id, card);
            send("tool", { name: call.function.name, state: "done", count: outcome.cards.length });
            messages.push({ role: "tool", tool_call_id: call.id, content: outcome.content });
          }
        }

        if (cards.size > 0) send("cards", { cards: [...cards.values()] });
        send("done", { model: used?.label ?? null, ms: Date.now() - startedAt });
      } catch (error) {
        const interrupted = (error as { textSent?: boolean }).textSent === true;
        if (!used) await admin.rpc("ai_refund", { p_user: auth.user.id });
        send("error", { code: interrupted ? "interrupted" : "unavailable" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-store", "X-AI-Remaining": String(remaining) },
  });
});
