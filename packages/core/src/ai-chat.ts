import { useCallback, useEffect, useRef, useState } from "react";
import type { AiMessage, AiStatus, StreamEvent } from "./ai-stream";

export type ChatPayloadMessage = { role: "user" | "assistant"; content: string };

export type ChatEvent = StreamEvent | { event: "remaining"; data: number };

export type ChatTransport = (messages: ChatPayloadMessage[], signal: AbortSignal) => AsyncIterable<ChatEvent>;

export type ChatPersistence = { load: () => Promise<AiMessage[]>; save: (messages: AiMessage[]) => void };

export class ChatHttpError extends Error {
  constructor(public status: number) {
    super(`ai-chat ${status}`);
  }
}

export const MAX_STORED_MESSAGES = 40;

export type ChatOutcome = "finished" | "stopped" | "limit" | "failed";

export const historyFor = (messages: AiMessage[]): ChatPayloadMessage[] =>
  messages.filter((message) => message.content.trim() && message.state !== "unavailable" && message.state !== "limit").map(({ role, content }) => ({ role, content }));

export function applyStreamEvent(message: AiMessage, event: StreamEvent): AiMessage {
  switch (event.event) {
    case "delta":
      return { ...message, content: message.content + event.data.text };
    case "model":
      return { ...message, model: { label: event.data.label, fallback: event.data.fallback } };
    case "tool":
      return {
        ...message,
        tools: event.data.state === "running" ? [...message.tools, event.data] : message.tools.map((tool) => (tool.name === event.data.name && tool.state === "running" ? event.data : tool)),
      };
    case "cards":
      return { ...message, cards: event.data.cards };
    case "done":
      return { ...message, state: "done", ms: event.data.ms };
    case "error":
      return { ...message, state: event.data.code };
  }
}

export function statusAfterEvent(event: StreamEvent): AiStatus | undefined {
  if (event.event === "model") return event.data.fallback ? "fallback" : "streaming";
  if (event.event === "done") return "ready";
  if (event.event === "error") return event.data.code === "unavailable" ? "unavailable" : "ready";
  return undefined;
}

export function applyOutcome(message: AiMessage, outcome: ChatOutcome): AiMessage {
  if (outcome === "stopped") return { ...message, state: "stopped" };
  if (outcome === "limit") return { ...message, state: "limit" };
  if (outcome === "failed") return { ...message, state: message.content ? "interrupted" : "unavailable" };
  return message.state === "streaming" ? { ...message, state: message.content ? "interrupted" : "unavailable" } : message;
}

export const statusAfterOutcome = (outcome: ChatOutcome, current: AiStatus): AiStatus =>
  outcome === "limit" ? "limit" : outcome === "failed" ? "unavailable" : outcome === "stopped" ? "ready" : current;

type Handlers = { onEvent: (event: StreamEvent) => void; onRemaining: (remaining: number) => void };

export async function streamReply(transport: ChatTransport, history: ChatPayloadMessage[], signal: AbortSignal, { onEvent, onRemaining }: Handlers): Promise<ChatOutcome> {
  try {
    for await (const item of transport(history, signal)) {
      if (item.event === "remaining") {
        if (Number.isFinite(item.data)) onRemaining(item.data);
      } else {
        onEvent(item);
      }
    }
    return signal.aborted ? "stopped" : "finished";
  } catch (error) {
    if (signal.aborted) return "stopped";
    return error instanceof ChatHttpError && error.status === 429 ? "limit" : "failed";
  }
}

export const restoreMessages = (stored: AiMessage[]): AiMessage[] =>
  stored.slice(-MAX_STORED_MESSAGES).map((message) => (message.state === "streaming" ? applyOutcome(message, "failed") : message));

export const prepareForStorage = (messages: AiMessage[]): AiMessage[] => messages.slice(-MAX_STORED_MESSAGES);

type UseAiChatOptions = { transport: ChatTransport; persistence?: ChatPersistence };

export function useAiChat({ transport, persistence }: UseAiChatOptions) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [status, setStatus] = useState<AiStatus>("ready");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(!persistence);
  const abort = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const transportRef = useRef(transport);
  transportRef.current = transport;
  const counter = useRef(0);

  const newId = () => `${Date.now().toString(36)}-${(counter.current++).toString(36)}`;

  const patchLast = useCallback((patch: (message: AiMessage) => AiMessage) => {
    setMessages((current) => current.map((message, index) => (index === current.length - 1 ? patch(message) : message)));
  }, []);

  useEffect(() => {
    if (!persistence) return;
    let cancelled = false;
    abort.current?.abort();
    setMessages([]);
    setStatus("ready");
    setHydrated(false);
    persistence
      .load()
      .then((stored) => {
        if (cancelled) return;
        setMessages(restoreMessages(stored));
        setHydrated(true);
      })
      .catch(() => !cancelled && setHydrated(true));
    return () => {
      cancelled = true;
    };
  }, [persistence]);

  useEffect(() => {
    if (!persistence || !hydrated || status === "streaming" || status === "fallback") return;
    persistence.save(prepareForStorage(messages));
  }, [messages, status, hydrated, persistence]);

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
      const outcome = await streamReply(transportRef.current, history, controller.signal, {
        onEvent: (event) => {
          patchLast((message) => applyStreamEvent(message, event));
          const next = statusAfterEvent(event);
          if (next) setStatus(next);
        },
        onRemaining: setRemaining,
      });
      abort.current = null;
      patchLast((message) => applyOutcome(message, outcome));
      setStatus((current) => (outcome === "finished" && (current === "streaming" || current === "fallback") ? "ready" : statusAfterOutcome(outcome, current)));
      if (outcome === "limit") setRemaining(0);
    },
    [patchLast],
  );

  const stop = useCallback(() => abort.current?.abort(), []);

  const clear = useCallback(() => {
    abort.current?.abort();
    setMessages([]);
    setStatus((current) => (current === "limit" ? current : "ready"));
  }, []);

  return { messages, status, remaining, hydrated, send, stop, clear };
}
