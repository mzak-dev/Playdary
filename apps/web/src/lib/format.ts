export const gamesCount = (n: number) => `${n.toLocaleString("pl-PL")} ${n === 1 ? "gra" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "gry" : "gier"}`;
