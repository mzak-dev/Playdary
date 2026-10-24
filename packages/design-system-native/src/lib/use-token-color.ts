import { darkColors, lightColors, nativeSoftColors } from "@playdary/tokens";
import { useColorScheme } from "react-native";

const dark = { ...darkColors, ...nativeSoftColors.dark };
const light: Partial<Record<TokenName, string>> = { ...lightColors, ...nativeSoftColors.light };

export type TokenName = keyof typeof dark;

export const useTokenColor = (token: TokenName) => {
  const scheme = useColorScheme();
  return (scheme === "light" ? light[token] : undefined) ?? dark[token];
};
