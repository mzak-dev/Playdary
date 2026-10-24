export const THEMES = ["Ciemny", "Jasny"] as const;
export type Theme = (typeof THEMES)[number];

export const decodeTheme = (raw: string | null): Theme => (raw === "Jasny" ? "Jasny" : "Ciemny");
