import { useSyncExternalStore } from "react";

const STORAGE_KEY = "playdary:polish-quotes";

const listeners = new Set<() => void>();

const readPolishQuotes = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writePolishQuotes = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    return;
  } finally {
    listeners.forEach((listener) => listener());
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePolishQuotes = () => [useSyncExternalStore(subscribe, readPolishQuotes, () => false), writePolishQuotes] as const;
