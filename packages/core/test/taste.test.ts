import { describe, expect, it } from "vitest";
import { averageScore, histogram, topGenres } from "../src/taste";
import type { RatedGame } from "../src/profile";

const rated = (title: string, score: number, genres: string[]): RatedGame => ({
  score,
  game: { id: title.length, title, genres, platforms: [], releaseDate: null, score: null, hypes: 0, cover: null },
});

describe("taste", () => {
  const RATED = [rated("A", 10, ["RPG", "Akcja"]), rated("B", 10, ["RPG"]), rated("C", 3, ["Horror"])];

  it("builds a ten-bucket histogram", () => {
    expect(histogram(RATED)).toEqual([0, 0, 1, 0, 0, 0, 0, 0, 0, 2]);
  });

  it("averages scores and returns null without ratings", () => {
    expect(averageScore(RATED)).toBeCloseTo(23 / 3);
    expect(averageScore([])).toBeNull();
  });

  it("ranks genres by count and breaks ties alphabetically", () => {
    expect(topGenres(RATED, 3)).toEqual([
      ["RPG", 2],
      ["Akcja", 1],
      ["Horror", 1],
    ]);
  });
});
