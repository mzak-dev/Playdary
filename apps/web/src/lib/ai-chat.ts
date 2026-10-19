import { useCallback, useRef, useState } from "react";
import { supabase } from "./supabase";

export type ChatCard = {
  id: number;
  name: string;
  cover: string | null;
  release_date: number | null;
  score: number | null;
  genres: string[];
  platforms: string[];
  list?: string;
};

export type ToolStep = { name: string; state: "running" | "done"; count?: number };

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools: ToolStep[];
  cards: ChatCard[];
  model?: { label: string; fallback: boolean };
  ms?: number;
  state: "streaming" | "done" | "stopped" | "interrupted" | "unavailable" | "limit";
};

export type AiStatus = "ready" | "streaming" | "fallback" | "unavailable" | "limit";

type StreamEvent =
  | { event: "delta"; data: { text: string } }
  | { event: "model"; data: { id: string; label: string; fallback: boolean } }
  | { event: "tool"; data: ToolStep }
  | { event: "cards"; data: { cards: ChatCard[] } }
  | { event: "done"; data: { model: string | null; ms: number } }
  | { event: "error"; data: { code: "interrupted" | "unavailable" } };

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export const parseSseBlocks = (buffer: string) => {
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";
  const events = blocks.flatMap((block) => {
    const event = block.match(/^event: (.+)$/m)?.[1];
    const data = block.match(/^data: (.+)$/m)?.[1];
    if (!event || !data) return [];
    try {
      return [{ event, data: JSON.parse(data) } as StreamEvent];
    } catch {
      return [];
    }
  });
  return { events, rest };
};

class ChatHttpError extends Error {
  constructor(public status: number) {
    super(`ai-chat ${status}`);
  }
}

async function* streamChat(messages: { role: string; content: string }[], signal: AbortSignal) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, mode: "chat" }),
  });
  if (!response.ok || !response.body) throw new ChatHttpError(response.status);

  yield { event: "remaining" as const, data: Number(response.headers.get("x-ai-remaining")) };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseBlocks(buffer);
    buffer = parsed.rest;
    yield* parsed.events;
  }
}

const newId = () => crypto.randomUUID();

const historyFor = (messages: AiMessage[]) =>
  messages.filter((message) => message.content.trim() && message.state !== "unavailable" && message.state !== "limit").map(({ role, content }) => ({ role, content }));

export function useAiChat() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [status, setStatus] = useState<AiStatus>("ready");
  const [remaining, setRemaining] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const patchLast = useCallback((patch: (message: AiMessage) => AiMessage) => {
    setMessages((current) => current.map((message, index) => (index === current.length - 1 ? patch(message) : message)));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || abort.current) return;

      const history = [...historyFor(messagesRef.current), { role: "user" as const, content }];
      const reply: AiMessage = { id: newId(), role: "assistant", content: "", tools: [], cards: [], state: "streaming" };
      setMessages((current) => [...current, { id: newId(), role: "user", content, tools: [], cards: [], state: "done" }, reply]);
      setStatus("streaming");

      const controller = new AbortController();
      abort.current = controller;
      try {
        for await (const item of streamChat(history, controller.signal)) {
          if (item.event === "remaining") {
            if (Number.isFinite(item.data)) setRemaining(item.data);
          } else if (item.event === "delta") {
            patchLast((message) => ({ ...message, content: message.content + item.data.text }));
          } else if (item.event === "model") {
            patchLast((message) => ({ ...message, model: { label: item.data.label, fallback: item.data.fallback } }));
            setStatus(item.data.fallback ? "fallback" : "streaming");
          } else if (item.event === "tool") {
            patchLast((message) => ({
              ...message,
              tools: item.data.state === "running" ? [...message.tools, item.data] : message.tools.map((tool) => (tool.name === item.data.name && tool.state === "running" ? item.data : tool)),
            }));
          } else if (item.event === "cards") {
            patchLast((message) => ({ ...message, cards: item.data.cards }));
          } else if (item.event === "done") {
            patchLast((message) => ({ ...message, state: "done", ms: item.data.ms }));
            setStatus("ready");
          } else if (item.event === "error") {
            patchLast((message) => ({ ...message, state: item.data.code }));
            setStatus(item.data.code === "unavailable" ? "unavailable" : "ready");
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          patchLast((message) => ({ ...message, state: "stopped" }));
          setStatus("ready");
        } else if (error instanceof ChatHttpError && error.status === 429) {
          patchLast((message) => ({ ...message, state: "limit" }));
          setStatus("limit");
          setRemaining(0);
        } else {
          patchLast((message) => ({ ...message, state: message.content ? "interrupted" : "unavailable" }));
          setStatus("unavailable");
        }
      } finally {
        abort.current = null;
      }
    },
    [patchLast],
  );

  const stop = useCallback(() => abort.current?.abort(), []);

  const clear = useCallback(() => {
    abort.current?.abort();
    setMessages([]);
    setStatus((current) => (current === "limit" ? current : "ready"));
  }, []);

  return { messages, status, remaining, send, stop, clear };
}
