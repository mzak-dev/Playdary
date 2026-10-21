import type { ActivityKind } from "@playdary/design-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type FriendCard = {
  id: string;
  username: string;
  since: number;
  done: number | null;
  rated: number | null;
  match: number | null;
  playing: { id: number; name: string } | null;
  muted: boolean;
};

export type FriendEvent = {
  friendId: string;
  username: string;
  kind: ActivityKind;
  gameId: number;
  gameName: string;
  cover: string | null;
  score: number | null;
  createdAt: number;
};

export type FriendDetail = { common: { id: number; name: string }[]; events: FriendEvent[] };

export type FriendRequest = { direction: "incoming" | "outgoing"; id: string; username: string; createdAt: number; mutual: number };

export type Relation = "none" | "friend" | "incoming" | "outgoing";
export type FoundUser = { id: string; username: string; relation: Relation; mutual: number };

type EventRow = { friend_id: string; username: string; kind: ActivityKind; game_id: number; game_name: string; cover: string | null; score: number | null; created_at: string };

const toEvent = (row: EventRow): FriendEvent => ({
  friendId: row.friend_id,
  username: row.username,
  kind: row.kind,
  gameId: row.game_id,
  gameName: row.game_name,
  cover: row.cover,
  score: row.score,
  createdAt: Date.parse(row.created_at),
});

const rpc = async <T>(name: string, args?: Record<string, unknown>) => {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
};

export const useFriendCards = () =>
  useQuery({
    queryKey: ["social", "cards"],
    queryFn: async (): Promise<FriendCard[]> => {
      const rows = await rpc<
        { friend_id: string; username: string; since: string; done: number | null; rated: number | null; match: number | null; playing_id: number | null; playing_name: string | null; muted: boolean }[]
      >("friend_cards");
      return rows.map((row) => ({
        id: row.friend_id,
        username: row.username,
        since: Date.parse(row.since),
        done: row.done,
        rated: row.rated,
        match: row.match,
        playing: row.playing_id === null || row.playing_name === null ? null : { id: row.playing_id, name: row.playing_name },
        muted: row.muted,
      }));
    },
  });

export const useFriendActivity = () =>
  useQuery({
    queryKey: ["social", "activity"],
    queryFn: async () => (await rpc<EventRow[]>("friend_activity", { p_limit: 40 })).map(toEvent),
  });

export const useFriendDetail = (friendId: string | null) =>
  useQuery({
    queryKey: ["social", "detail", friendId],
    enabled: friendId !== null,
    queryFn: async (): Promise<FriendDetail> => {
      const data = await rpc<{ common: { id: number; name: string }[]; events: EventRow[] } | null>("friend_detail", { p_friend: friendId });
      return { common: data?.common ?? [], events: (data?.events ?? []).map(toEvent) };
    },
  });

export const useFriendRequests = () =>
  useQuery({
    queryKey: ["social", "requests"],
    queryFn: async (): Promise<FriendRequest[]> => {
      const rows = await rpc<{ direction: FriendRequest["direction"]; user_id: string; username: string; created_at: string; mutual: number }[]>("friend_requests");
      return rows.map((row) => ({ direction: row.direction, id: row.user_id, username: row.username, createdAt: Date.parse(row.created_at), mutual: row.mutual }));
    },
  });

export const useSearchUsers = (query: string) =>
  useQuery({
    queryKey: ["social", "search", query],
    enabled: query.length >= 2,
    queryFn: async (): Promise<FoundUser[]> => {
      const rows = await rpc<{ user_id: string; username: string; relation: Relation; mutual: number }[]>("search_users", { q: query });
      return rows.map((row) => ({ id: row.user_id, username: row.username, relation: row.relation, mutual: row.mutual }));
    },
  });

const pairFilter = (a: string, b: string) => `and(user_id.eq.${a},friend_id.eq.${b}),and(user_id.eq.${b},friend_id.eq.${a})`;

type Action = { kind: "send" | "accept" | "end" | "mute" | "unmute"; otherId: string };

export function useFriendAction(userId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ kind, otherId }: Action) => {
      const result =
        kind === "send"
          ? await supabase.from("friendships").insert({ user_id: userId, friend_id: otherId, status: "pending" })
          : kind === "accept"
            ? await supabase.from("friendships").update({ status: "accepted" }).eq("user_id", otherId).eq("friend_id", userId)
            : kind === "end"
              ? await supabase.from("friendships").delete().or(pairFilter(userId, otherId))
              : kind === "mute"
                ? await supabase.from("friend_mutes").insert({ user_id: userId, friend_id: otherId })
                : await supabase.from("friend_mutes").delete().eq("user_id", userId).eq("friend_id", otherId);
      if (result.error) throw new Error(result.error.message);
    },
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["social"] }),
        client.invalidateQueries({ queryKey: ["friends"] }),
        client.invalidateQueries({ queryKey: ["my-friends", userId] }),
        client.invalidateQueries({ queryKey: ["profile-stats", userId] }),
      ]),
  });
}

const RELATIVE = new Intl.RelativeTimeFormat("pl", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

export function relativeTime(timestamp: number, now = Date.now()) {
  const diff = timestamp - now;
  const [unit, size] = UNITS.find(([, ms]) => Math.abs(diff) >= ms) ?? UNITS[2]!;
  return Math.abs(diff) < 60_000 ? "przed chwilą" : RELATIVE.format(Math.round(diff / size), unit);
}

export const friendsCount = (n: number) => (n === 1 ? "1 znajomy" : `${n} znajomych`);
export const mutualLabel = (n: number) => (n === 1 ? "1 wspólny znajomy" : `${n} wspólnych znajomych`);
