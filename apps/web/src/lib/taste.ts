import type { RatedGame } from "./profile";

export const histogram = (rated: RatedGame[]) => Array.from({ length: 10 }, (_, i) => rated.filter((r) => r.score === i + 1).length);

export const averageScore = (rated: RatedGame[]) => (rated.length ? rated.reduce((sum, r) => sum + r.score, 0) / rated.length : null);

export const topGenres = (rated: RatedGame[], limit = 4) => {
  const counts = new Map<string, number>();
  for (const { game } of rated) for (const genre of game.genres.slice(0, 2)) counts.set(genre, (counts.get(genre) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pl")).slice(0, limit);
};

export const ratingsCount = (n: number) => `${n} ${n === 1 ? "ocena" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "oceny" : "ocen"}`;

