import { averageScore, histogram, igdbImage, ratingsCount, topGenres, useFriendCards, useMyFriends, useRatedGames } from "@playdary/core";
import { Avatar, Button, MatchMeter, Skeleton } from "@playdary/design-system-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ErrorText, Muted } from "../panel";

const Card = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <View className="gap-4 rounded-lg bg-secondary p-6">
    <View className="flex-row items-center justify-between gap-3">
      <Text accessibilityRole="header" className="font-sans-bold text-xs leading-4 tracking-wider text-primary uppercase">
        {title}
      </Text>
      {action}
    </View>
    {children}
  </View>
);

export function Overview({ userId, onShowRatings }: { userId: string; onShowRatings: () => void }) {
  const router = useRouter();
  const rated = useRatedGames(userId);
  const friends = useMyFriends(userId);
  const cards = useFriendCards();

  if (rated.isPending) return <Skeleton className="h-72 rounded-lg" />;
  if (rated.error) return <ErrorText>Nie udało się wczytać ocen: {rated.error.message}</ErrorText>;

  const ratings = rated.data;
  const counts = histogram(ratings);
  const peak = Math.max(1, ...counts);
  const average = averageScore(ratings);
  const genres = topGenres(ratings);
  const mostGenres = Math.max(1, ...genres.map(([, n]) => n));
  const bestMatches = [...(cards.data ?? [])].filter((card) => card.match !== null).sort((a, b) => b.match! - a.match!).slice(0, 3);

  return (
    <View className="gap-4">
      <Card title="Twój gust">
        {average === null ? (
          <Muted>Oceń pierwszą grę, żeby zobaczyć swój gust.</Muted>
        ) : (
          <>
            <View className="flex-row items-baseline gap-3">
              <Text className="font-display-extrabold text-5xl leading-[52px] text-rating">{average.toFixed(1)}</Text>
              <Text className="shrink font-sans text-sm text-muted-foreground">średnia z {ratingsCount(ratings.length)}</Text>
            </View>
            <View accessibilityRole="image" accessibilityLabel="Rozkład Twoich ocen od 1 do 10" className="h-28 flex-row items-end gap-1.5">
              {counts.map((n, i) => (
                <View key={i} className="h-full flex-1 justify-end gap-1.5">
                  <View className="min-h-[3px] rounded-sm bg-rating" style={{ height: `${(n / peak) * 100}%`, opacity: n ? 1 : 0.25 }} />
                  <Text className="text-center font-sans text-[11px] leading-[11px] text-muted-foreground">{i + 1}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>

      <Card title="Twoja półka" action={<Text className="font-sans text-[13px] text-muted-foreground">Najwyżej ocenione</Text>}>
        {ratings.length === 0 && <Muted>Nie oceniono jeszcze żadnej gry.</Muted>}
        <View className="flex-row gap-3">
          {ratings.slice(0, 3).map(({ game, score }) => (
            <Pressable key={game.id} accessibilityRole="button" accessibilityLabel={`${game.title}, ocena ${score} z 10`} onPress={() => router.push(`/games/${game.id}`)} className="aspect-[3/4] flex-1 overflow-hidden rounded-md bg-accent active:opacity-80">
              {game.cover && <Image source={{ uri: igdbImage(game.cover, "t_cover_big") }} contentFit="cover" style={StyleSheet.absoluteFill} />}
              <View className="absolute top-2 left-2 rounded-full bg-background px-2 py-0.5">
                <Text className="font-display text-sm text-rating">{score}</Text>
              </View>
              <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 8, paddingBottom: 8, paddingTop: 32 }}>
                <Text numberOfLines={2} className="font-sans-semibold text-[13px] leading-4 text-white">
                  {game.title}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
        {ratings.length > 3 && (
          <View className="flex-row">
            <Button variant="ghost" size="sm" onPress={onShowRatings}>
              Wszystkie oceny
            </Button>
          </View>
        )}
      </Card>

      <Card title="Ulubione gatunki">
        {genres.length === 0 && <Muted>Pojawią się po pierwszych ocenach.</Muted>}
        <View className="gap-3">
          {genres.map(([name, n]) => (
            <View key={name} className="flex-row items-center gap-3">
              <Text numberOfLines={1} className="w-[96px] font-sans-medium text-sm text-foreground">
                {name}
              </Text>
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-input-soft">
                <View className="h-full rounded-full bg-primary" style={{ width: `${(n / mostGenres) * 100}%` }} />
              </View>
              <Text className="min-w-4 text-right font-sans-bold text-sm text-foreground">{n}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card
        title={`Znajomi · ${friends.data?.length ?? 0}`}
        action={
          <Button variant="ghost" size="sm" onPress={() => router.navigate("/friends")}>
            Wszyscy
          </Button>
        }
      >
        {friends.data?.length === 0 && <Muted>Nie masz jeszcze znajomych.</Muted>}
        {friends.error && <ErrorText>Nie udało się wczytać znajomych: {friends.error.message}</ErrorText>}
        <View className="flex-row">
          {friends.data?.slice(0, 8).map((friend, i) => (
            <Avatar key={friend.id} name={friend.username} className={i > 0 ? "-ml-2" : ""} />
          ))}
        </View>
        {bestMatches.length > 0 && (
          <View className="gap-3">
            <Text className="font-sans text-[13px] text-muted-foreground">Najbardziej zgodny gust</Text>
            {bestMatches.map((card) => (
              <View key={card.id} className="gap-1.5">
                <Text numberOfLines={1} className="font-sans-semibold text-[15px] text-foreground">
                  {card.username}
                </Text>
                <MatchMeter value={card.match} />
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}
