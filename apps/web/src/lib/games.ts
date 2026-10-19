import type { Friend, Game } from "@playdary/design-system";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { embedText } from "./embed";
import { useServerEmbeddings } from "./embed-settings";
import { toRpcParams, type Filters } from "./filters";
import { polishTags } from "./labels";
import { supabase } from "./supabase";

export type GameRow = {
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

const PAGE_SIZE = 24;
const STALE_TIME = 5 * 60_000;

export const GAME_COLUMNS =
  "id, name, hypes, score, release_date, cover:data->>cover, genres:data->genres, themes:data->themes, platforms:data->platforms";

export const toGame = (row: GameRow): Game => ({
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

const games = () => supabase.from("games").select(GAME_COLUMNS);

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

type Ref = { id: number; name: string };

export type Details = {
  ageRatings: { organization: string | null; rating: string | null; descriptors: string[] }[];
  releases: { platform: string | null; date: number | null; region: string | null; status: string | null }[];
  multiplayer: {
    platform: string | null;
    onlineMax: number;
    onlineCoopMax: number;
    offlineMax: number;
    offlineCoopMax: number;
    splitscreen: boolean;
    campaignCoop: boolean;
    lanCoop: boolean;
    dropIn: boolean;
  }[];
  languages: { name: string; audio: boolean; subtitles: boolean; interface: boolean }[];
  websites: { type: string; url: string }[];
  steamId: string | null;
  developers: string[];
  publishers: string[];
  modes: string[];
  perspectives: string[];
  gameType: string | null;
  related: {
    dlcs: Ref[];
    expansions: Ref[];
    standaloneExpansions: Ref[];
    remakes: Ref[];
    remasters: Ref[];
    ports: Ref[];
    bundles: Ref[];
    parent: Ref | null;
    versionParent: Ref | null;
    franchises: string[];
    collections: string[];
  };
  timeToBeat: { hastily: number | null; normally: number | null; completely: number | null; count: number } | null;
};

export type GameDetail = {
  game: Game;
  summary: string | null;
  storyline: string | null;
  screenshots: string[];
  videos: string[];
  ratingCount: number | null;
  details: Details | null;
};

type DetailRow = Omit<GameRow, "cover" | "genres" | "themes" | "platforms"> & {
  rating_count: number | null;
  details: Details | null;
  data: {
    cover: string | null;
    genres: string[];
    themes: string[];
    platforms: string[];
    summary: string | null;
    storyline: string | null;
    screenshots: string[];
    videos: string[];
  };
};

export const useGame = (gameId: number) =>
  useQuery({
    queryKey: ["games", "detail", gameId],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<GameDetail | null> => {
      const { data, error } = await supabase
        .from("games")
        .select("id, name, hypes, score, release_date, rating_count, data, details")
        .eq("id", gameId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const row = data as unknown as DetailRow;
      return {
        game: toGame({ ...row, ...row.data }),
        summary: row.data.summary,
        storyline: row.data.storyline,
        screenshots: row.data.screenshots,
        videos: row.data.videos,
        ratingCount: row.rating_count,
        details: row.details,
      };
    },
  });

export const useExistingGameIds = (ids: number[]) =>
  useQuery({
    queryKey: ["games", "existing", ids],
    enabled: ids.length > 0,
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("id").in("id", ids);
      if (error) throw new Error(error.message);
      return new Set(data.map((row) => row.id as number));
    },
  });

export type Requirements = { minimum: { key: string; value: string }[]; recommended: { key: string; value: string }[] };

export const useRequirements = (steamId: string | null) =>
  useQuery({
    queryKey: ["requirements", steamId],
    enabled: steamId !== null,
    staleTime: STALE_TIME,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<Requirements>("steam-requirements", { body: { appId: steamId } });
      if (error || !data) throw new Error(error?.message ?? "Brak danych");
      return data;
    },
  });

export const useSimilar = (gameId: number) =>
  useQuery({
    queryKey: ["games", "similar", gameId],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("similar_games", { p_game_id: gameId, p_limit: 6 });
      return toGames({ data, error });
    },
  });

const useQueryEmbedding = (query: string) => {
  const [serverEmbeddings] = useServerEmbeddings();
  return useQuery({
    queryKey: ["embedding", query, serverEmbeddings],
    enabled: query.length > 1,
    staleTime: Infinity,
    retry: false,
    queryFn: () => embedText(query),
  });
};

export const useSearch = (query: string) => {
  const embedding = useQueryEmbedding(query).data ?? null;

  return useQuery({
    queryKey: ["games", "search", query, embedding !== null],
    enabled: query.length > 1,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<Game[]> => {
      const { data, error } = await supabase.rpc("search_games", { q: query, q_embedding: embedding, lim: 6 });
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
};

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
