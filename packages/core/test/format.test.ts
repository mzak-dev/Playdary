import { describe, expect, it } from "vitest";
import { friendsCount, mutualLabel, relativeTime } from "../src/friends";
import { gamesCount } from "../src/format";
import { ratingsCount } from "../src/taste";

describe("Polish plurals", () => {
  it.each([
    [1, "1 ocena"],
    [2, "2 oceny"],
    [5, "5 ocen"],
    [12, "12 ocen"],
    [22, "22 oceny"],
    [112, "112 ocen"],
  ])("ratingsCount(%i)", (n, expected) => expect(ratingsCount(n)).toBe(expected));

  it("pluralises games, friends and mutual friends", () => {
    expect(gamesCount(1)).toBe("1 gra");
    expect(gamesCount(3)).toBe("3 gry");
    expect(friendsCount(1)).toBe("1 znajomy");
    expect(friendsCount(4)).toBe("4 znajomych");
    expect(mutualLabel(1)).toBe("1 wspólny znajomy");
    expect(mutualLabel(3)).toBe("3 wspólnych znajomych");
  });
});

describe("relativeTime", () => {
  const NOW = Date.parse("2026-06-15T12:00:00Z");

  it("says just now within a minute", () => {
    expect(relativeTime(NOW - 30_000, NOW)).toBe("przed chwilą");
  });

  it("uses the largest fitting unit", () => {
    expect(relativeTime(NOW - 2 * 3_600_000, NOW)).toMatch(/2 godz/);
    expect(relativeTime(NOW - 86_400_000, NOW)).toBe("wczoraj");
  });
});
