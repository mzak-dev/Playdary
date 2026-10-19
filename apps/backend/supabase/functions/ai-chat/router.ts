export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = { role: Role; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string; name?: string };

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string }; extra_content?: unknown };

export type ToolCallDelta = { index?: number; id?: string; function?: { name?: string; arguments?: string }; extra_content?: unknown };

export type Cooldowns = Map<string, number>;

export const sanitizeMessages = (input: unknown, maxMessages: number, maxLength: number) => {
  if (!Array.isArray(input) || input.length === 0) return null;
  const messages = input.slice(-maxMessages);
  const clean: { role: "user" | "assistant"; content: string }[] = [];
  for (const message of messages) {
    const { role, content } = (message ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) return null;
    clean.push({ role, content: content.slice(0, maxLength) });
  }
  return clean.at(-1)?.role === "user" ? clean : null;
};

export const availableModels = <T extends { id: string; tools: boolean }>(chain: T[], cooldowns: Cooldowns, now: number, needsTools: boolean) =>
  chain.filter((model) => (cooldowns.get(model.id) ?? 0) <= now && (!needsTools || model.tools));

export const cooldownMs = (status: number, retryAfterSeconds: number | null) => {
  if (status === 429) return Math.max((retryAfterSeconds ?? 60) * 1000, 30_000);
  if (status === 401 || status === 403 || status === 404) return 60 * 60_000;
  if (status === 408 || status >= 500) return 60_000;
  return 5 * 60_000;
};

export class ToolCallAccumulator {
  private calls: ToolCall[] = [];
  private byIndex = new Map<number, ToolCall>();

  add(delta: ToolCallDelta) {
    const call = this.find(delta);
    if (delta.extra_content) call.extra_content = delta.extra_content;
    const name = delta.function?.name;
    if (name && call.function.name !== name) call.function.name += name;
    if (delta.function?.arguments) call.function.arguments += delta.function.arguments;
  }

  private find({ index, id }: ToolCallDelta) {
    const existing = id ? this.calls.find((call) => call.id === id) : this.byIndex.get(index ?? -1) ?? this.calls.at(-1);
    if (existing) return existing;
    const created: ToolCall = { id: id ?? `call_${this.calls.length}`, type: "function", function: { name: "", arguments: "" } };
    this.calls.push(created);
    if (index !== undefined) this.byIndex.set(index, created);
    return created;
  }

  result() {
    return this.calls.filter((call) => call.function.name);
  }
}

export const parseSseLines = (buffer: string) => {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  const payloads = lines.map((line) => line.trim()).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim());
  return { payloads, rest };
};
