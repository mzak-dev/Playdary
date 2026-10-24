import { ChatHttpError, parseSseBlocks, useAiChat as useSharedAiChat, type ChatTransport } from "@playdary/core";
import { supabase } from "./supabase";

export type { AiMessage, AiStatus, ChatCard } from "@playdary/core";

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const streamChat: ChatTransport = async function* (messages, signal) {
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
};

export const useAiChat = () => useSharedAiChat({ transport: streamChat });
