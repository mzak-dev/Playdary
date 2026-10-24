import type { GameList } from "./types";

export const LISTS: { id: GameList; label: string }[] = [
  { id: "playing", label: "Gram" },
  { id: "wishlist", label: "Chcę zagrać" },
  { id: "done", label: "Ukończone" },
  { id: "dropped", label: "Porzucone" },
];
