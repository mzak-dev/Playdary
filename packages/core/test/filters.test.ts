import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, activeFilterCount, toRpcParams } from "../src/filters";

describe("toRpcParams", () => {
  it("maps default filters to the popular tab with empty lists", () => {
    expect(toRpcParams(DEFAULT_FILTERS)).toEqual({
      p_tab: "popular",
      p_platforms: [],
      p_genres: [],
      p_themes: [],
      p_period: "any",
      p_min_score: 0,
      p_sort: "default",
      p_hide_listed: false,
    });
  });

  it("splits picked genres into genres and themes and translates platform labels", () => {
    const params = toRpcParams({ ...DEFAULT_FILTERS, tab: "Nadchodzące", platforms: ["XSX", "PC"], genres: ["Akcja", "RPG"] });
    expect(params.p_tab).toBe("upcoming");
    expect(params.p_platforms).toEqual(["PC", "Series X|S"]);
    expect(params.p_genres).toEqual(["Role-playing (RPG)"]);
    expect(params.p_themes).toEqual(["Action"]);
  });
});

describe("activeFilterCount", () => {
  it("counts every non-default choice once", () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, platforms: ["PC", "PS5"], period: "year", minScore: 75, sort: "score", hideListed: true })).toBe(6);
  });
});
