import type { KeyValueStorage } from "@playdary/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTING_KEYS = ["playdary:theme", "playdary:polish-quotes"];

const cache = new Map<string, string>();

export const hydrateStorage = async () => {
  const pairs = await AsyncStorage.multiGet(SETTING_KEYS);
  for (const [key, value] of pairs) if (value !== null) cache.set(key, value);
};

export const nativeStorage: KeyValueStorage = {
  getItem: (key) => cache.get(key) ?? null,
  setItem: (key, value) => {
    cache.set(key, value);
    void AsyncStorage.setItem(key, value);
  },
};
