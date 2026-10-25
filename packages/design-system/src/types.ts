export type GameList = "playing" | "wishlist" | "done" | "dropped";

export type Game = {
  id: number;
  title: string;
  genres: string[];
  platforms: string[];
  releaseDate: number | null;
  score: number | null;
  hypes: number;
  cover: string | null;
  summary?: string | null;
  developer?: string | null;
};

export type Friend = {
  kind: "follow" | "rated";
  users: { name: string; score?: number }[];
};
