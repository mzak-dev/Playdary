import type { Game } from "@playdary/design-system";
import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GAME_COLUMNS, toGame, type GameRow } from "./games";
import { supabase } from "./supabase";

export type Privacy = "everyone" | "friends" | "private";
export type Notifications = { friends: boolean; release: boolean; digest: boolean };
export const PRIVACY: Record<string, Privacy> = { Wszyscy: "everyone", Znajomi: "friends", "Tylko ja": "private" };
export const PRIVACY_LABELS = Object.keys(PRIVACY);

export type Profile = { username: string; privacy: Privacy; notifications: Notifications };

const profileKey = (userId: string) => ["profile", userId];

export const useProfile = (userId: string) =>
  useQuery({
    queryKey: profileKey(userId),
    staleTime: Infinity,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from("profiles").select("username, privacy, notifications").eq("id", userId).single();
      if (error) throw new Error(error.message);
      return data as Profile;
    },
  });

export function useUsername(session: Session) {
  const { data } = useProfile(session.user.id);
  return data?.username ?? session.user.email?.split("@")[0] ?? "";
}

export function useUpdateProfile(userId: string) {
  const client = useQueryClient();
  const key = profileKey(userId);

  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Profile>(key);
      if (previous) client.setQueryData(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (_error, _patch, context) => client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}

export type ProfileStats = { follows: number; rated: number; listed: number; friends: number };

const count = async (query: PromiseLike<{ count: number | null; error: { message: string } | null }>) => {
  const { count: total, error } = await query;
  if (error) throw new Error(error.message);
  return total ?? 0;
};

export const useProfileStats = (userId: string) =>
  useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: async (): Promise<ProfileStats> => {
      const head = { count: "exact", head: true } as const;
      const [follows, rated, listed, friends] = await Promise.all([
        count(supabase.from("follows").select("*", head).eq("user_id", userId)),
        count(supabase.from("ratings").select("*", head).eq("user_id", userId)),
        count(supabase.from("list_items").select("*", head)),
        count(supabase.from("friendships").select("*", head).eq("status", "accepted")),
      ]);
      return { follows, rated, listed, friends };
    },
  });

export type RatedGame = { game: Game; score: number };

export const useRatedGames = (userId: string) =>
  useQuery({
    queryKey: ["rated-games", userId],
    queryFn: async (): Promise<RatedGame[]> => {
      const { data, error } = await supabase.from("ratings").select(`score, games(${GAME_COLUMNS})`).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return (data as unknown as { score: number; games: GameRow | null }[])
        .flatMap((row) => (row.games ? [{ game: toGame(row.games), score: row.score }] : []))
        .sort((a, b) => b.score - a.score || a.game.title.localeCompare(b.game.title, "pl"));
    },
  });

export type FriendProfile = { id: string; username: string };

export const useMyFriends = (userId: string) =>
  useQuery({
    queryKey: ["my-friends", userId],
    queryFn: async (): Promise<FriendProfile[]> => {
      const { data, error } = await supabase
        .from("friendships")
        .select("user_id, friend_id, requester:profiles!friendships_user_id_fkey(id, username), recipient:profiles!friendships_friend_id_fkey(id, username)")
        .eq("status", "accepted");
      if (error) throw new Error(error.message);
      const rows = data as unknown as { user_id: string; requester: FriendProfile; recipient: FriendProfile }[];
      return rows.map((row) => (row.user_id === userId ? row.recipient : row.requester)).sort((a, b) => a.username.localeCompare(b.username, "pl"));
    },
  });

