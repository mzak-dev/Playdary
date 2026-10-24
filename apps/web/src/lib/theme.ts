import { createSetting, decodeTheme, THEMES, useSetting, type Theme } from "@playdary/core";
import { webStorage } from "./web-storage";

export { THEMES, type Theme };

const themeSetting = createSetting<Theme>({ storage: webStorage, key: "playdary:theme", fallback: "Ciemny", decode: decodeTheme, encode: (theme) => theme });

const applyTheme = (theme: Theme) => document.documentElement.classList.toggle("light", theme === "Jasny");

export const applyStoredTheme = () => applyTheme(themeSetting.get());

export function setTheme(theme: Theme) {
  applyTheme(theme);
  themeSetting.set(theme);
}

export const useTheme = () => useSetting(themeSetting)[0];
