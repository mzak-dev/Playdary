import type { Friend, Game } from "@playdary/design-system";

const DAY = 86_400_000;
const inDays = (days: number) => Date.now() + days * DAY;

const game = (id: number, title: string, genres: string[], platforms: string[], releaseDays: number | null, score: number | null, follows: number): Game => ({
  id,
  title,
  genres,
  platforms,
  releaseDate: releaseDays === null ? null : inDays(releaseDays),
  score,
  follows,
  cover: null,
});

export const sampleGames: Game[] = [
  game(1, "Grand Theft Auto VI", ["Akcja", "Otwarty świat"], ["PS5", "XSX"], 42, null, 184_200),
  game(2, "Hollow Knight: Silksong", ["Platformówka", "Metroidvania"], ["PC", "NS"], 18, null, 96_400),
  game(3, "Marvel's Wolverine", ["Akcja", "Przygodowa"], ["PS5"], 120, null, 61_800),
  game(4, "Fable", ["RPG", "Fantasy"], ["XSX", "PC"], 75, null, 48_900),
  game(5, "Ghost of Yōtei", ["Akcja", "Otwarty świat"], ["PS5"], 9, null, 72_300),
  game(6, "Metroid Prime 4", ["Strzelanka", "Przygodowa"], ["NS"], 31, null, 39_700),
  game(7, "The Witcher 4", ["RPG", "Fantasy"], ["PC", "PS5"], null, null, 120_500),
  game(8, "Elden Ring", ["RPG", "Souls-like"], ["PC", "PS5", "XSX"], -1700, 96, 154_000),
  game(9, "Baldur's Gate 3", ["RPG", "Strategia"], ["PC", "PS5"], -1100, 96, 131_000),
  game(10, "Hades II", ["Roguelike", "Akcja"], ["PC", "NS"], -240, 93, 58_200),
  game(11, "Red Dead Redemption 2", ["Akcja", "Western"], ["PC", "PS4"], -2800, 95, 142_300),
  game(12, "Celeste", ["Platformówka", "Indie"], ["PC", "NS"], -3000, 92, 44_100),
];

export const sampleFriends: Record<number, Friend> = {
  1: { kind: "follow", users: [{ name: "ola_k" }, { name: "marek" }, { name: "kasia" }] },
  2: { kind: "follow", users: [{ name: "marek" }] },
  8: { kind: "rated", users: [{ name: "ola_k", score: 10 }] },
  9: { kind: "rated", users: [{ name: "marek", score: 9 }, { name: "kasia", score: 10 }] },
};

export const sampleQuotes = [
  { text: "War. War never changes.", game: "Fallout", year: 1997 },
  { text: "Stay awhile and listen.", game: "Diablo", year: 1996 },
  { text: "The cake is a lie.", game: "Portal", year: 2007 },
];
