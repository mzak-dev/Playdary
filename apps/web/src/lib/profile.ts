import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export function useUsername(session: Session) {
  const { data } = useQuery({
    queryKey: ["profile", session.user.id],
    staleTime: Infinity,
    queryFn: async () => (await supabase.from("profiles").select("username").eq("id", session.user.id).single()).data,
  });
  return data?.username ?? session.user.email?.split("@")[0] ?? "";
}
