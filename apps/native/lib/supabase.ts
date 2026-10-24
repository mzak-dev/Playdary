import { createPlaydaryClient } from "@playdary/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabaseAnonKey, supabaseUrl } from "./env";

export const supabase = createPlaydaryClient(supabaseUrl ?? "http://localhost", supabaseAnonKey ?? "missing", {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
