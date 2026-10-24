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

export type StreamEvent =
  | { event: "delta"; data: { text: string } }
  | { event: "model"; data: { id: string; label: string; fallback: boolean } }
  | { event: "tool"; data: ToolStep }
  | { event: "cards"; data: { cards: ChatCard[] } }
  | { event: "done"; data: { model: string | null; ms: number } }
  | { event: "error"; data: { code: "interrupted" | "unavailable" } };

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
