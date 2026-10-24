import { createSetting, decodeTheme, flagSetting, useSetting, type Theme } from "@playdary/core";
import { Appearance } from "react-native";
import { nativeStorage } from "./storage";

const themeSetting = createSetting<Theme>({ storage: nativeStorage, key: "playdary:theme", fallback: "Ciemny", decode: decodeTheme, encode: (theme) => theme });

const polishQuotesSetting = flagSetting(nativeStorage, "playdary:polish-quotes");

const applyTheme = (theme: Theme) => Appearance.setColorScheme?.(theme === "Jasny" ? "light" : "dark");

export const applyStoredTheme = () => applyTheme(themeSetting.get());

export const setTheme = (theme: Theme) => {
  applyTheme(theme);
  themeSetting.set(theme);
};

export const useTheme = () => useSetting(themeSetting)[0];

export const usePolishQuotes = () => useSetting(polishQuotesSetting);
