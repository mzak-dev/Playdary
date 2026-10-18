export const TABS = [
  { label: "Popularne", id: "popular" },
  { label: "Nadchodzące", id: "upcoming" },
  { label: "Najlepiej oceniane", id: "best" },
  { label: "Nowe premiery", id: "new" },
  { label: "Klasyki", id: "classics" },
] as const;
export type TabLabel = (typeof TABS)[number]["label"];

export const PLATFORMS = [
  { label: "PC", value: "PC" },
  { label: "PS5", value: "PS5" },
  { label: "XSX", value: "Series X|S" },
  { label: "Switch", value: "Switch" },
] as const;

export const GENRES = [
  { label: "Akcja", kind: "themes", value: "Action" },
  { label: "RPG", kind: "genres", value: "Role-playing (RPG)" },
  { label: "Otwarty świat", kind: "themes", value: "Open world" },
  { label: "Przygodowa", kind: "genres", value: "Adventure" },
  { label: "Strzelanka", kind: "genres", value: "Shooter" },
  { label: "Horror", kind: "themes", value: "Horror" },
  { label: "Indie", kind: "genres", value: "Indie" },
  { label: "Turowe", kind: "genres", value: "Turn-based strategy (TBS)" },
  { label: "Platformówka", kind: "genres", value: "Platform" },
] as const;

export const PERIODS = [
  { label: "Dowolna", value: "any" },
  { label: "Ostatnie 12 mies.", value: "12m" },
  { label: "Ten rok", value: "year" },
  { label: "Starsze", value: "older" },
] as const;

export const SCORES = [
  { label: "Dowolna", value: 0 },
  { label: "60+", value: 60 },
  { label: "75+", value: 75 },
  { label: "85+", value: 85 },
] as const;

export const SORTS = [
  { label: "Domyślnie", value: "default" },
  { label: "Popularność", value: "popularity" },
  { label: "Hype", value: "hype" },
  { label: "Ocena", value: "score" },
  { label: "Data premiery", value: "date" },
  { label: "Alfabetycznie", value: "alpha" },
] as const;

export type Filters = {
  tab: TabLabel;
  platforms: string[];
  genres: string[];
  period: (typeof PERIODS)[number]["value"];
  minScore: number;
  sort: (typeof SORTS)[number]["value"];
  hideListed: boolean;
};

export const DEFAULT_FILTERS: Filters = { tab: "Popularne", platforms: [], genres: [], period: "any", minScore: 0, sort: "default", hideListed: false };

export const activeFilterCount = (f: Filters) =>
  f.platforms.length + f.genres.length + (f.period !== "any" ? 1 : 0) + (f.minScore ? 1 : 0) + (f.sort !== "default" ? 1 : 0) + (f.hideListed ? 1 : 0);

export const toRpcParams = (f: Filters) => {
  const picked = GENRES.filter((g) => f.genres.includes(g.label));
  return {
    p_tab: TABS.find((t) => t.label === f.tab)?.id ?? "popular",
    p_platforms: PLATFORMS.filter((p) => f.platforms.includes(p.label)).map((p) => p.value),
    p_genres: picked.filter((g) => g.kind === "genres").map((g) => g.value),
    p_themes: picked.filter((g) => g.kind === "themes").map((g) => g.value),
    p_period: f.period,
    p_min_score: f.minScore,
    p_sort: f.sort,
    p_hide_listed: f.hideListed,
  };
};
