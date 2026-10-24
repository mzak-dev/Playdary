import { describe, expect, it } from "vitest";
import { DEFAULT_SEARCH_FILTERS, facetCounts, filterGames, searchFilterCount } from "../src/search-filters";
import type { Game } from "../src/types";

const NOW = Date.parse("2026-06-15T12:00:00Z");

const game = (overrides: Partial<Game> & Pick<Game, "id" | "title">): Game => ({
  genres: [],
  platforms: [],
  releaseDate: null,
  score: null,
  hypes: 0,
  cover: null,
  ...overrides,
});

const GAMES = [
  game({ id: 1, title: "Zelda", platforms: ["Switch"], genres: ["Przygodowa"], score: 95, releaseDate: Date.parse("2026-03-01"), hypes: 10 }),
  game({ id: 2, title: "Alan Wake", platforms: ["PC", "PS5"], genres: ["Horror"], score: 80, releaseDate: Date.parse("2020-01-01"), hypes: 50 }),
  game({ id: 3, title: "Bez oceny", platforms: ["PC"], genres: ["RPG"], score: null, releaseDate: null, hypes: 5 }),
];

const ids = (games: Game[]) => games.map((g) => g.id);

describe("filterGames", () => {
  it("keeps everything under default filters", () => {
    expect(ids(filterGames(GAMES, DEFAULT_SEARCH_FILTERS, {}, NOW))).toEqual([1, 2, 3]);
  });

  it("filters by platform label, genre label and minimum score", () => {
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, platforms: ["PC"] }, {}, NOW))).toEqual([2, 3]);
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, genres: ["Horror"] }, {}, NOW))).toEqual([2]);
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, minScore: 85 }, {}, NOW))).toEqual([1]);
  });

  it("drops games without a release date when a period is chosen", () => {
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, period: "year" }, {}, NOW))).toEqual([1]);
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, period: "older" }, {}, NOW))).toEqual([2]);
  });

  it("hides listed games on request", () => {
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, hideListed: true }, { 2: "done" }, NOW))).toEqual([1, 3]);
  });

  it("sorts by score with unrated games last and alphabetically in Polish order", () => {
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, sort: "score" }, {}, NOW))).toEqual([1, 2, 3]);
    expect(ids(filterGames(GAMES, { ...DEFAULT_SEARCH_FILTERS, sort: "alpha" }, {}, NOW))).toEqual([2, 3, 1]);
  });
});

describe("facets and counts", () => {
  it("counts games per platform and genre", () => {
    const facets = facetCounts(GAMES);
    expect(facets.platforms.find((p) => p.label === "PC")?.count).toBe(2);
    expect(facets.genres.find((g) => g.label === "Horror")?.count).toBe(1);
  });

  it("does not count the sort as an active filter", () => {
    expect(searchFilterCount({ ...DEFAULT_SEARCH_FILTERS, sort: "score", platforms: ["PC"] })).toBe(1);
  });
});
