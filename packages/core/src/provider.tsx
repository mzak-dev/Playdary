import { createContext, useContext, type ReactNode } from "react";
import type { PlaydaryClient } from "./client";
import type { Embedder } from "./platform";

type Services = { supabase: PlaydaryClient; embedder: Embedder };

const PlaydaryContext = createContext<Services | null>(null);

export function PlaydaryProvider({ supabase, embedder, children }: Services & { children: ReactNode }) {
  return <PlaydaryContext value={{ supabase, embedder }}>{children}</PlaydaryContext>;
}

export function usePlaydary() {
  const services = useContext(PlaydaryContext);
  if (!services) throw new Error("usePlaydary needs a PlaydaryProvider");
  return services;
}
