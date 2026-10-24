import type { KeyValueStorage } from "@playdary/core";

export const webStorage: KeyValueStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable: the value lives for this session only
    }
  },
};
