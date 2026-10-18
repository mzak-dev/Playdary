import type { Game, GameList } from "@playdary/design-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GAME_COLUMNS, toGame, type GameRow } from "./games";
import { supabase } from "./supabase";

type ListsByGame = Record<number, GameList>;

export const useUserLists = (userId: string) =>
  useQuery({
    queryKey: ["lists", userId],
    queryFn: async (): Promise<ListsByGame> => {
      const { data, error } = await supabase.from("list_items").select("game_id, lists(name)");
      if (error) throw new Error(error.message);
      const byGame: ListsByGame = {};
      for (const row of data as unknown as { game_id: number; lists: { name: GameList } | null }[]) {
        if (row.lists) byGame[row.game_id] = row.lists.name;
      }
      return byGame;
    },
  });

export const useListedGames = (userId: string) =>
  useQuery({
    queryKey: ["lists-games", userId],
    queryFn: async (): Promise<Game[]> => {
      const { data, error } = await supabase.from("list_items").select(`game_id, games(${GAME_COLUMNS})`);
      if (error) throw new Error(error.message);
      return (data as unknown as { games: GameRow | null }[]).flatMap((row) => (row.games ? [toGame(row.games)] : []));
    },
  });

export function useSetList(userId: string) {
  const client = useQueryClient();
  const key = ["lists", userId];

  return useMutation({
    mutationFn: async ({ gameId, list }: { gameId: number; list: GameList | null }) => {
      const cleared = await supabase.from("list_items").delete().eq("game_id", gameId);
      if (cleared.error) throw new Error(cleared.error.message);
      if (!list) return;

      const target = await supabase.from("lists").upsert({ user_id: userId, name: list }, { onConflict: "user_id,name" }).select("id").single();
      if (target.error) throw new Error(target.error.message);
      const added = await supabase.from("list_items").insert({ list_id: target.data.id, game_id: gameId });
      if (added.error) throw new Error(added.error.message);
    },
    onMutate: async ({ gameId, list }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<ListsByGame>(key);
      const next = { ...previous };
      if (list) next[gameId] = list;
      else delete next[gameId];
      client.setQueryData(key, next);
      return { previous };
    },
    onError: (_error, _vars, context) => client.setQueryData(key, context?.previous),
    onSettled: () => Promise.all([client.invalidateQueries({ queryKey: key }), client.invalidateQueries({ queryKey: ["lists-games", userId] })]),
  });
}

export const useMyRating = (userId: string, gameId: number) =>
  useQuery({
    queryKey: ["rating", userId, gameId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ratings").select("score").eq("user_id", userId).eq("game_id", gameId).maybeSingle();
      if (error) throw new Error(error.message);
      return (data?.score as number | undefined) ?? 0;
    },
  });

export function useSetRating(userId: string, gameId: number) {
  const client = useQueryClient();
  const key = ["rating", userId, gameId];

  return useMutation({
    mutationFn: async (score: number) => {
      const { error } = score
        ? await supabase.from("ratings").upsert({ user_id: userId, game_id: gameId, score })
        : await supabase.from("ratings").delete().eq("user_id", userId).eq("game_id", gameId);
      if (error) throw new Error(error.message);
    },
    onMutate: async (score) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<number>(key);
      client.setQueryData(key, score);
      return { previous };
    },
    onError: (_error, _score, context) => client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
