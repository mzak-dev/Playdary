export type GameList = "playing" | "wishlist" | "done" | "dropped";

export type Game = {
  id: number;
  title: string;
  genres: string[];
  platforms: string[];
  releaseDate: number | null;
  score: number | null;
  follows: number;
  cover: string | null;
};

export type Friend = {
  kind: "follow" | "rated";
  users: { name: string; score?: number }[];
};
