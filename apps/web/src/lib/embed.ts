type Pending = { resolve: (vector: number[]) => void; reject: (error: Error) => void };

const pending = new Map<number, Pending>();
let worker: Worker | undefined;
let nextId = 0;

const getWorker = () => {
  if (worker) return worker;
  worker = new Worker(new URL("./embed.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<{ id: number; vector?: number[]; error?: string }>) => {
    const { id, vector, error } = event.data;
    const request = pending.get(id);
    pending.delete(id);
    if (error || !vector) request?.reject(new Error(error ?? "Brak wektora"));
    else request?.resolve(vector);
  };
  return worker;
};

export const embedText = (text: string) =>
  new Promise<number[]>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, text });
  });
