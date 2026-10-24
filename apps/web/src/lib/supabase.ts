import { createPlaydaryClient } from "@playdary/core";

export const supabase = createPlaydaryClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
