import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { usePlaydary } from "./provider";

export function useRandomCovers(count = 28) {
  const { supabase } = usePlaydary();
  const [draw] = useState(Math.random);
  const { data } = useQuery({
    queryKey: ["random-covers", draw],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("random_covers", { p_count: count });
      if (error) throw new Error(error.message);
      return data as string[];
    },
  });
  return data ?? [];
}
