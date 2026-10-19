import assert from "node:assert/strict";
import { test } from "node:test";
import { availableModels, cooldownMs, parseSseLines, sanitizeMessages, ToolCallAccumulator } from "../supabase/functions/ai-chat/router.ts";

const chain = [
  { id: "a", tools: true },
  { id: "b", tools: false },
  { id: "c", tools: true },
];

test("skips models on cooldown and without tools when tools are needed", () => {
  const cooldowns = new Map([["a", 2000]]);
  assert.deepEqual(availableModels(chain, cooldowns, 1000, true).map((m) => m.id), ["c"]);
  assert.deepEqual(availableModels(chain, cooldowns, 3000, false).map((m) => m.id), ["a", "b", "c"]);
});

test("rate limit cooldown honours Retry-After but never drops below 30s", () => {
  assert.equal(cooldownMs(429, 120), 120_000);
  assert.equal(cooldownMs(429, 1), 30_000);
  assert.equal(cooldownMs(404, null), 3_600_000);
});

test("accepts only user and assistant roles and requires a final user message", () => {
  assert.equal(sanitizeMessages([{ role: "system", content: "x" }], 20, 100), null);
  assert.equal(sanitizeMessages([{ role: "assistant", content: "x" }], 20, 100), null);
  assert.deepEqual(sanitizeMessages([{ role: "user", content: "abcdef" }], 20, 3), [{ role: "user", content: "abc" }]);
});

test("groups two parallel tool calls without index by id", () => {
  const acc = new ToolCallAccumulator();
  acc.add({ id: "x1", function: { name: "search_games", arguments: '{"query":"rpg"}' } });
  acc.add({ id: "x2", function: { name: "my_lists", arguments: "{}" } });
  assert.deepEqual(acc.result().map((c) => [c.id, c.function.name, c.function.arguments]), [
    ["x1", "search_games", '{"query":"rpg"}'],
    ["x2", "my_lists", "{}"],
  ]);
});

test("groups OpenAI-style indexed fragments", () => {
  const acc = new ToolCallAccumulator();
  acc.add({ index: 0, id: "a", function: { name: "search_games", arguments: "" } });
  acc.add({ index: 1, id: "b", function: { name: "my_lists", arguments: "" } });
  acc.add({ index: 0, function: { arguments: '{"query":' } });
  acc.add({ index: 0, function: { arguments: '"x"}' } });
  acc.add({ index: 1, function: { arguments: "{}" } });
  assert.deepEqual(acc.result().map((c) => c.function.arguments), ['{"query":"x"}', "{}"]);
});

test("splits SSE buffer and keeps the incomplete tail", () => {
  const { payloads, rest } = parseSseLines('data: {"a":1}\n\ndata: [DONE]\n\ndata: {"b"');
  assert.deepEqual(payloads, ['{"a":1}', "[DONE]"]);
  assert.equal(rest, 'data: {"b"');
});
