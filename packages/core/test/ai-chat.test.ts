import { describe, expect, it } from "vitest";
import type { AiMessage, StreamEvent } from "../src/ai-stream";
import {
  ChatHttpError,
  MAX_STORED_MESSAGES,
  applyOutcome,
  applyStreamEvent,
  historyFor,
  prepareForStorage,
  restoreMessages,
  statusAfterEvent,
  statusAfterOutcome,
  streamReply,
  type ChatEvent,
  type ChatTransport,
} from "../src/ai-chat";

const message = (overrides: Partial<AiMessage> = {}): AiMessage => ({ id: "m", role: "assistant", content: "", tools: [], cards: [], state: "streaming", ...overrides });

const apply = (events: StreamEvent[], start = message()) => events.reduce(applyStreamEvent, start);

describe("applyStreamEvent", () => {
  it("appends text deltas", () => {
    expect(apply([{ event: "delta", data: { text: "Cześć" } }, { event: "delta", data: { text: " świecie" } }]).content).toBe("Cześć świecie");
  });

  it("records the model and marks a fallback", () => {
    const result = apply([{ event: "model", data: { id: "x", label: "Gemini", fallback: true } }]);
    expect(result.model).toEqual({ label: "Gemini", fallback: true });
  });

  it("adds a running tool and then replaces it with the finished one", () => {
    const result = apply([
      { event: "tool", data: { name: "search_games", state: "running" } },
      { event: "tool", data: { name: "search_games", state: "done", count: 3 } },
    ]);
    expect(result.tools).toEqual([{ name: "search_games", state: "done", count: 3 }]);
  });

  it("keeps two parallel tools separate", () => {
    const result = apply([
      { event: "tool", data: { name: "search_games", state: "running" } },
      { event: "tool", data: { name: "my_lists", state: "running" } },
      { event: "tool", data: { name: "my_lists", state: "done", count: 1 } },
    ]);
    expect(result.tools.map((tool) => `${tool.name}:${tool.state}`)).toEqual(["search_games:running", "my_lists:done"]);
  });

  it("stores cards, duration and stream errors", () => {
    const card = { id: 1, name: "Hades", cover: null, release_date: null, score: 93, genres: [], platforms: [] };
    expect(apply([{ event: "cards", data: { cards: [card] } }]).cards).toEqual([card]);
    expect(apply([{ event: "done", data: { model: "Gemini", ms: 1200 } }])).toMatchObject({ state: "done", ms: 1200 });
    expect(apply([{ event: "error", data: { code: "interrupted" } }]).state).toBe("interrupted");
  });
});

describe("statusAfterEvent", () => {
  it("maps events to the chat status", () => {
    expect(statusAfterEvent({ event: "model", data: { id: "x", label: "A", fallback: false } })).toBe("streaming");
    expect(statusAfterEvent({ event: "model", data: { id: "x", label: "A", fallback: true } })).toBe("fallback");
    expect(statusAfterEvent({ event: "done", data: { model: null, ms: 1 } })).toBe("ready");
    expect(statusAfterEvent({ event: "error", data: { code: "unavailable" } })).toBe("unavailable");
    expect(statusAfterEvent({ event: "error", data: { code: "interrupted" } })).toBe("ready");
    expect(statusAfterEvent({ event: "delta", data: { text: "x" } })).toBeUndefined();
  });
});

describe("historyFor", () => {
  it("drops empty messages and replies that never came", () => {
    const history = historyFor([
      message({ id: "1", role: "user", content: "Cześć", state: "done" }),
      message({ id: "2", content: "", state: "unavailable" }),
      message({ id: "3", content: "limit", state: "limit" }),
      message({ id: "4", content: "Odpowiedź", state: "done" }),
      message({ id: "5", role: "user", content: "   ", state: "done" }),
    ]);
    expect(history).toEqual([
      { role: "user", content: "Cześć" },
      { role: "assistant", content: "Odpowiedź" },
    ]);
  });
});

describe("applyOutcome", () => {
  it("marks failures by whether text had arrived", () => {
    expect(applyOutcome(message({ content: "część" }), "failed").state).toBe("interrupted");
    expect(applyOutcome(message(), "failed").state).toBe("unavailable");
    expect(applyOutcome(message(), "limit").state).toBe("limit");
    expect(applyOutcome(message({ content: "x" }), "stopped").state).toBe("stopped");
  });

  it("closes a stream that ended without a done event", () => {
    expect(applyOutcome(message({ content: "urwane" }), "finished").state).toBe("interrupted");
    expect(applyOutcome(message({ content: "ok", state: "done" }), "finished").state).toBe("done");
  });

  it("maps outcomes to a status", () => {
    expect(statusAfterOutcome("limit", "streaming")).toBe("limit");
    expect(statusAfterOutcome("failed", "streaming")).toBe("unavailable");
    expect(statusAfterOutcome("stopped", "streaming")).toBe("ready");
    expect(statusAfterOutcome("finished", "unavailable")).toBe("unavailable");
  });
});

const collect = async (transport: ChatTransport, signal = new AbortController().signal) => {
  const events: StreamEvent[] = [];
  const remaining: number[] = [];
  const outcome = await streamReply(transport, [{ role: "user", content: "hej" }], signal, { onEvent: (event) => events.push(event), onRemaining: (n) => remaining.push(n) });
  return { outcome, events, remaining };
};

async function* from(items: ChatEvent[]) {
  for (const item of items) yield item;
}

describe("streamReply", () => {
  it("passes events through and reports the remaining quota", async () => {
    const result = await collect(() => from([{ event: "remaining", data: 12 }, { event: "delta", data: { text: "a" } }, { event: "done", data: { model: null, ms: 5 } }]));
    expect(result).toMatchObject({ outcome: "finished", remaining: [12] });
    expect(result.events.map((event) => event.event)).toEqual(["delta", "done"]);
  });

  it("ignores a remaining header that is not a number", async () => {
    expect((await collect(() => from([{ event: "remaining", data: Number.NaN }]))).remaining).toEqual([]);
  });

  it("returns limit for HTTP 429 and failed for other errors", async () => {
    const failing = (error: Error): ChatTransport => async function* () {
      yield* [] as ChatEvent[];
      throw error;
    };
    expect((await collect(failing(new ChatHttpError(429)))).outcome).toBe("limit");
    expect((await collect(failing(new ChatHttpError(503)))).outcome).toBe("failed");
    expect((await collect(failing(new TypeError("network")))).outcome).toBe("failed");
  });

  it("returns stopped when the request was aborted", async () => {
    const controller = new AbortController();
    const transport: ChatTransport = async function* () {
      yield { event: "delta", data: { text: "a" } };
      controller.abort();
      throw new Error("aborted");
    };
    expect((await collect(transport, controller.signal)).outcome).toBe("stopped");
  });
});

describe("persistence helpers", () => {
  const many = Array.from({ length: 55 }, (_, i) => message({ id: String(i), state: "done", content: `m${i}` }));

  it("keeps only the latest messages", () => {
    expect(prepareForStorage(many)).toHaveLength(MAX_STORED_MESSAGES);
    expect(prepareForStorage(many)[0]?.id).toBe("15");
    expect(restoreMessages(many)).toHaveLength(MAX_STORED_MESSAGES);
  });

  it("restores a message that was streaming when the app closed as interrupted", () => {
    const [restored] = restoreMessages([message({ content: "pół odpowiedzi" })]);
    expect(restored?.state).toBe("interrupted");
    expect(restoreMessages([message()])[0]?.state).toBe("unavailable");
  });
});
