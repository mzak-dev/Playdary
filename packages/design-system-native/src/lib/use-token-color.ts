import { darkColors, lightColors, type ColorToken } from "@playdary/tokens";
import { useColorScheme } from "react-native";

export const useTokenColor = (token: ColorToken) => {
  const scheme = useColorScheme();
  return (scheme === "light" ? lightColors[token] : undefined) ?? darkColors[token];
};
