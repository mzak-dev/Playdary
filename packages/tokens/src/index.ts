export const darkColors = {
  background: "#000000",
  foreground: "#ffffff",
  card: "#0c0c0f",
  cardForeground: "#ffffff",
  popover: "#131317",
  popoverForeground: "#ffffff",
  primary: "#1fa9ec",
  primaryForeground: "#00131f",
  secondary: "#1b1b20",
  secondaryForeground: "#ffffff",
  muted: "#141418",
  mutedForeground: "#a1a1aa",
  accent: "#26262c",
  accentForeground: "#ffffff",
  destructive: "#ff5a5f",
  destructiveForeground: "#1a0000",
  border: "#2a2a31",
  input: "#6e6e79",
  ring: "#1fa9ec",
  highlight: "#f5e90a",
  highlightForeground: "#0a0a00",
  success: "#2fd158",
  successForeground: "#001a08",
  rating: "#f5e90a",
  coverEmber: "#f26b3a",
  coverTeal: "#2ec4b6",
  coverRose: "#f0608f",
  coverLime: "#a3e635",
  coverSky: "#4cc3ff",
} as const;

export type ColorToken = keyof typeof darkColors;

export const lightColors: Partial<Record<ColorToken, string>> = {
  background: "#ffffff",
  foreground: "#09090b",
  card: "#f7f7f8",
  cardForeground: "#09090b",
  popover: "#ffffff",
  popoverForeground: "#09090b",
  primary: "#0870a6",
  primaryForeground: "#ffffff",
  secondary: "#eeeef1",
  secondaryForeground: "#09090b",
  muted: "#f3f3f5",
  mutedForeground: "#52525b",
  accent: "#e4e4e9",
  accentForeground: "#09090b",
  destructive: "#c4181f",
  destructiveForeground: "#ffffff",
  border: "#dcdce1",
  input: "#71717a",
  ring: "#0870a6",
  success: "#137a2e",
  successForeground: "#ffffff",
  rating: "#8a6d00",
};

export const popShadow = {
  dark: "0 16px 40px 0 rgba(0, 0, 0, 0.6)",
  light: "0 16px 40px 0 rgba(9, 9, 11, 0.18)",
} as const;

export const baseRadius = "28px";

export const radii = { sm: "8px", md: "14px", lg: "28px", xl: "40px" } as const;

export const fonts = {
  web: { display: '"Sora Variable", system-ui, sans-serif', sans: '"DM Sans Variable", system-ui, sans-serif' },
  native: {
    display: "Sora_700Bold",
    "display-semibold": "Sora_600SemiBold",
    "display-extrabold": "Sora_800ExtraBold",
    sans: "DMSans_400Regular",
    "sans-medium": "DMSans_500Medium",
    "sans-semibold": "DMSans_600SemiBold",
    "sans-bold": "DMSans_700Bold",
  },
} as const;
