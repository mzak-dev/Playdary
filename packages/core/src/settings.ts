import { useSyncExternalStore } from "react";
import type { KeyValueStorage } from "./platform";

export type Setting<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  fallback: T;
};

type SettingOptions<T> = { storage: KeyValueStorage; key: string; fallback: T; decode: (raw: string | null) => T; encode: (value: T) => string };

export function createSetting<T>({ storage, key, fallback, decode, encode }: SettingOptions<T>): Setting<T> {
  const listeners = new Set<() => void>();
  return {
    fallback,
    get: () => decode(storage.getItem(key)),
    set: (value) => {
      storage.setItem(key, encode(value));
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const flagSetting = (storage: KeyValueStorage, key: string) =>
  createSetting({ storage, key, fallback: false, decode: (raw) => raw === "1", encode: (value) => (value ? "1" : "0") });

export const useSetting = <T,>(setting: Setting<T>) => [useSyncExternalStore(setting.subscribe, setting.get, () => setting.fallback), setting.set] as const;
