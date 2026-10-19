import { useSyncExternalStore } from "react";

const STORAGE_KEY = "playdary:server-embeddings";

const listeners = new Set<() => void>();

export const readServerEmbeddings = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeServerEmbeddings = (enabled: boolean) => {
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

export const useServerEmbeddings = () =>
  [useSyncExternalStore(subscribe, readServerEmbeddings), writeServerEmbeddings] as const;
