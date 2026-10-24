import { useSyncExternalStore } from "react";

const STORAGE_KEY = "playdary:overlay-cards";

const listeners = new Set<() => void>();

const readOverlayCards = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
};

const writeOverlayCards = (enabled: boolean) => {
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

export const useOverlayCards = () => [useSyncExternalStore(subscribe, readOverlayCards, () => true), writeOverlayCards] as const;
