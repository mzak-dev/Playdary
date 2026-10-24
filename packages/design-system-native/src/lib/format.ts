export const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

export const pluralPeople = (n: number) => (n === 1 ? "osoba" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "osoby" : "osób");
