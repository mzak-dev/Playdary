import { ChatHttpError, parseSseBlocks, type ChatTransport } from "@playdary/core";
import { fetch } from "expo/fetch";
import { supabaseAnonKey, supabaseUrl } from "./env";
import { supabase } from "./supabase";

export const streamChat: ChatTransport = async function* (messages, signal) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      apikey: supabaseAnonKey ?? "",
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
