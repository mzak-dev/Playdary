import type { Game, GameList } from "@playdary/design-system";
import { GENRES, PERIODS, PLATFORMS, SCORES } from "./filters";
import { polishTags } from "./labels";

export const SEARCH_SORTS = [
  { label: "Trafność", value: "relevance" },
  { label: "Ocena", value: "score" },
  { label: "Data premiery", value: "date" },
  { label: "Popularność", value: "hype" },
  { label: "Alfabetycznie", value: "alpha" },
] as const;

export type SearchFilters = {
  platforms: string[];
  genres: string[];
  period: (typeof PERIODS)[number]["value"];
  minScore: number;
  sort: (typeof SEARCH_SORTS)[number]["value"];
  hideListed: boolean;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = { platforms: [], genres: [], period: "any", minScore: 0, sort: "relevance", hideListed: false };

export const searchFilterCount = (f: SearchFilters) => f.platforms.length + f.genres.length + (f.period !== "any" ? 1 : 0) + (f.minScore ? 1 : 0) + (f.hideListed ? 1 : 0);

const YEAR = 365 * 86_400_000;

const matchesPeriod = (game: Game, period: SearchFilters["period"], now: number) => {
  if (period === "any") return true;
  if (game.releaseDate === null) return false;
  if (period === "12m") return game.releaseDate >= now - YEAR && game.releaseDate <= now + YEAR;
  const year = new Date(game.releaseDate).getFullYear();
  return period === "year" ? year === new Date(now).getFullYear() : year < new Date(now).getFullYear();
};

const genreLabel = (genre: (typeof GENRES)[number]) => polishTags([genre.value])[0]!;

export const filterGames = (games: Game[], f: SearchFilters, lists: Record<number, GameList>, now = Date.now()) => {
  const platformValues = PLATFORMS.filter((p) => f.platforms.includes(p.label)).map((p) => p.value);
  const genreLabels = GENRES.filter((g) => f.genres.includes(g.label)).map(genreLabel);

  const kept = games.filter(
    (game) =>
      (platformValues.length === 0 || platformValues.some((p) => game.platforms.includes(p))) &&
      (genreLabels.length === 0 || genreLabels.some((g) => game.genres.includes(g))) &&
      matchesPeriod(game, f.period, now) &&
      (game.score ?? 0) >= f.minScore &&
      !(f.hideListed && lists[game.id]),
  );

  if (f.sort === "score") return kept.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  if (f.sort === "date") return kept.sort((a, b) => (b.releaseDate ?? -Infinity) - (a.releaseDate ?? -Infinity));
  if (f.sort === "hype") return kept.sort((a, b) => b.hypes - a.hypes);
  if (f.sort === "alpha") return kept.sort((a, b) => a.title.localeCompare(b.title, "pl"));
  return kept;
};

export const facetCounts = (games: Game[]) => ({
  platforms: PLATFORMS.map((p) => ({ label: p.label, count: games.filter((g) => g.platforms.includes(p.value)).length })),
  genres: GENRES.map((g) => ({ label: g.label, count: games.filter((game) => game.genres.includes(genreLabel(g))).length })),
});

export { PERIODS, SCORES };
