export type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type Embedder = {
  id: string;
  embed: (text: string) => Promise<number[]>;
};
