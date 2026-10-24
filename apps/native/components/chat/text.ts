import type { AiStatus, ChatCard } from "@playdary/core";

export const SUGGESTIONS = ["Jakie gry mają najbliższą premierę?", "Polecisz coś z najwyższą oceną?", "Pokaż gry RPG", "Co mam na swoich listach?"];

export const STATUS_LABEL: Record<AiStatus, { text: string; tone: "ok" | "busy" | "warn" | "down" }> = {
  ready: { text: "Połączony z bazą gier", tone: "ok" },
  streaming: { text: "Odpowiada…", tone: "busy" },
  fallback: { text: "Odpowiada model zapasowy", tone: "warn" },
  unavailable: { text: "Asystent niedostępny", tone: "down" },
  limit: { text: "Dzienny limit wyczerpany", tone: "warn" },
};

export const TOOL_LABEL: Record<string, string> = {
  search_games: "Przeszukuję bazę gier…",
  upcoming_releases: "Sprawdzam premiery…",
  similar_games: "Szukam podobnych gier…",
  my_lists: "Czytam Twoje listy…",
};

export const plural = (n: number) => `${n} ${n === 1 ? "wynik" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "wyniki" : "wyników"}`;

export const cardSubtitle = (card: ChatCard) =>
  [card.release_date ? new Date(card.release_date).toLocaleDateString("pl-PL") : "Data TBA", card.score ? `ocena ${card.score}` : null].filter(Boolean).join(" · ");

export const seconds = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

export const gamePrompt = (title: string) => `Opowiedz mi o grze „${title}”: czy warto zagrać i co jest podobne?`;
