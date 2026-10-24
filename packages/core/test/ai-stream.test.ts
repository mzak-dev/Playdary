import { describe, expect, it } from "vitest";
import { parseSseBlocks } from "../src/ai-stream";

describe("parseSseBlocks", () => {
  it("returns complete events and keeps the unfinished tail", () => {
    const buffer = 'event: delta\ndata: {"text":"Hej"}\n\nevent: delta\ndata: {"text":" tu"';
    const { events, rest } = parseSseBlocks(buffer);
    expect(events).toEqual([{ event: "delta", data: { text: "Hej" } }]);
    expect(rest).toBe('event: delta\ndata: {"text":" tu"');
  });

  it("completes the tail once the rest of the block arrives", () => {
    const first = parseSseBlocks('event: done\ndata: {"model":null,');
    const second = parseSseBlocks(`${first.rest}"ms":12}\n\n`);
    expect(second.events).toEqual([{ event: "done", data: { model: null, ms: 12 } }]);
    expect(second.rest).toBe("");
  });

  it("skips blocks with invalid JSON or missing fields", () => {
    const { events } = parseSseBlocks('event: delta\ndata: {nope}\n\n: keep-alive\n\nevent: delta\ndata: {"text":"ok"}\n\n');
    expect(events).toEqual([{ event: "delta", data: { text: "ok" } }]);
  });
});
