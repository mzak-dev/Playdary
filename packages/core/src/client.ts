import { createClient, type SupabaseClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type PlaydaryClient = SupabaseClient<Database>;

export const createPlaydaryClient = (url: string, anonKey: string, options?: SupabaseClientOptions<"public">): PlaydaryClient =>
  createClient<Database>(url, anonKey, options);
