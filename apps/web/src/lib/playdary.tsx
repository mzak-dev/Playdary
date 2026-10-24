import { PlaydaryProvider, createServerEmbedder } from "@playdary/core";
import type { ReactNode } from "react";
import { deviceEmbedder } from "./embed";
import { useServerEmbeddings } from "./embed-settings";
import { supabase } from "./supabase";

const serverEmbedder = createServerEmbedder(supabase);

export function WebPlaydaryProvider({ children }: { children: ReactNode }) {
  const [serverEmbeddings] = useServerEmbeddings();
  return (
    <PlaydaryProvider supabase={supabase} embedder={serverEmbeddings ? serverEmbedder : deviceEmbedder}>
      {children}
    </PlaydaryProvider>
  );
}
