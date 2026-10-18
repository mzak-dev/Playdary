import { pipeline } from "@huggingface/transformers";

const reply = self as unknown as { postMessage: (message: unknown) => void };
let extractor: ReturnType<typeof loadExtractor> | undefined;

const loadExtractor = () => pipeline("feature-extraction", "Supabase/gte-small", { dtype: "q8" });

self.onmessage = async (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data;
  try {
    extractor ??= loadExtractor();
    const output = await (await extractor)(text, { pooling: "mean", normalize: true });
    reply.postMessage({ id, vector: Array.from(output.data as Float32Array) });
  } catch (error) {
    reply.postMessage({ id, error: String(error) });
  }
};
