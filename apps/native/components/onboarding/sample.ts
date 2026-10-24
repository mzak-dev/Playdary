import type { Game } from "@playdary/core";

const sample = (id: number, title: string, genres: string[], score: number): Game => ({
  id,
  title,
  genres,
  platforms: ["PC"],
  releaseDate: null,
  score,
  hypes: 0,
  cover: null,
});

export const SAMPLE_GAMES = [
  sample(1, "Outer Wilds", ["Przygodowa", "Eksploracja"], 92),
  sample(2, "Disco Elysium", ["RPG", "Kryminalna"], 91),
  sample(3, "Hades", ["Akcja", "Roguelike"], 93),
];
