import { useSyncExternalStore } from "react";

export const THEMES = ["Ciemny", "Jasny"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "playdary:theme";
const listeners = new Set<() => void>();

const read = (): Theme => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "Jasny" ? "Jasny" : "Ciemny";
  } catch {
    return "Ciemny";
  }
};

export const applyStoredTheme = () => document.documentElement.classList.toggle("light", read() === "Jasny");

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable: theme applies for this session only
  }
  document.documentElement.classList.toggle("light", theme === "Jasny");
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTheme = () => useSyncExternalStore(subscribe, read, () => "Ciemny" as Theme);
