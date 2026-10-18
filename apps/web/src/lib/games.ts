import type { Friend, Game } from "@playdary/design-system";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toRpcParams, type Filters } from "./filters";
import { polishTags } from "./labels";
import { supabase } from "./supabase";

type GameRow = {
  id: number;
  name: string;
  hypes: number;
  score: number | null;
  release_date: number | null;
  cover: string | null;
  genres: string[] | null;
  themes: string[] | null;
  platforms: string[] | null;
};

const COLUMNS =
  "id, name, hypes, score, release_date, cover:data->>cover, genres:data->genres, themes:data->themes, platforms:data->platforms";
const PAGE_SIZE = 24;
const STALE_TIME = 5 * 60_000;

const toGame = (row: GameRow): Game => ({
  id: row.id,
  title: row.name,
  genres: polishTags(row.themes, row.genres),
  platforms: row.platforms ?? [],
  releaseDate: row.release_date,
  score: row.score === null ? null : Math.round(row.score),
  hypes: row.hypes,
  cover: row.cover,
});

type Result = { data: unknown; error: { message: string } | null };

const toGames = ({ data, error }: Result) => {
  if (error) throw new Error(error.message);
  return ((data ?? []) as GameRow[]).map(toGame);
};

const games = () => supabase.from("games").select(COLUMNS);

export const useTopUpcoming = () =>
  useQuery({
    queryKey: ["games", "top-upcoming"],
    staleTime: STALE_TIME,
    queryFn: async () => toGames(await games().gt("release_date", Date.now()).order("hypes", { ascending: false }).limit(10)),
  });

export const useTicker = () =>
  useQuery({
    queryKey: ["games", "ticker"],
    staleTime: STALE_TIME,
    queryFn: async () => toGames(await games().gt("release_date", Date.now()).order("release_date").limit(20)),
  });

export const useBrowse = (filters: Filters) =>
  useInfiniteQuery({
    queryKey: ["games", "browse", filters],
    initialPageParam: 0,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc("browse_games", { ...toRpcParams(filters), p_limit: PAGE_SIZE, p_offset: pageParam });
      if (error) throw new Error(error.message);
      const rows = data as (GameRow & { total: number })[];
      return { games: rows.map(toGame), total: rows[0]?.total ?? 0 };
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((count, page) => count + page.games.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });

type SearchRow = { id: number; name: string; data: { cover: string | null; genres: string[]; themes: string[]; platforms: string[] } };

export const useSearch = (query: string) =>
  useQuery({
    queryKey: ["games", "search", query],
    enabled: query.length > 1,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<Game[]> => {
      const { data, error } = await supabase.rpc("search_games", { q: query, lim: 5 });
      if (error) throw new Error(error.message);
      return (data as SearchRow[]).map((row) => ({
        id: row.id,
        title: row.name,
        genres: polishTags(row.data.themes, row.data.genres),
        platforms: row.data.platforms,
        releaseDate: null,
        score: null,
        hypes: 0,
        cover: row.data.cover,
      }));
    },
  });

type FriendRow = { game_id: number; username: string; kind: Friend["kind"]; score: number | null };

export const useFriends = (gameIds: number[]) =>
  useQuery({
    queryKey: ["friends", gameIds],
    enabled: gameIds.length > 0,
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("friends_on_games", { ids: gameIds });
      if (error) throw new Error(error.message);
      const byGame: Record<number, Friend> = {};
      for (const row of (data as FriendRow[]).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "rated" ? -1 : 1))) {
        const friend = (byGame[row.game_id] ??= { kind: row.kind, users: [] });
        if (friend.kind === row.kind) friend.users.push({ name: row.username, ...(row.score ? { score: row.score } : {}) });
      }
      return byGame;
    },
  });

export const useFollows = (userId: string) =>
  useQuery({
    queryKey: ["follows", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("follows").select("game_id").eq("user_id", userId);
      if (error) throw new Error(error.message);
      return new Set(data.map((row) => row.game_id as number));
    },
  });

export function useToggleFollow(userId: string) {
  const client = useQueryClient();
  const key = ["follows", userId];

  return useMutation({
    mutationFn: async ({ gameId, follow }: { gameId: number; follow: boolean }) => {
      const { error } = follow
        ? await supabase.from("follows").insert({ user_id: userId, game_id: gameId })
        : await supabase.from("follows").delete().eq("user_id", userId).eq("game_id", gameId);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ gameId, follow }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Set<number>>(key);
      const next = new Set(previous);
      if (follow) next.add(gameId);
      else next.delete(gameId);
      client.setQueryData(key, next);
      return { previous };
    },
    onError: (_error, _vars, context) => client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
