import type { PlaydaryClient } from "./client";
import type { Embedder } from "./platform";

export const createServerEmbedder = (supabase: PlaydaryClient): Embedder => ({
  id: "server",
  embed: async (text) => {
    const { data, error } = await supabase.functions.invoke<{ vector: number[] }>("embed-query", { body: { text } });
    if (error || !data) throw new Error(error?.message ?? "Brak wektora");
    return data.vector;
  },
});
