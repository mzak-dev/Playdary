import type { Game } from "@playdary/core";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Countdown } from "./countdown";

type ReleaseTickerProps = { games: Game[]; onOpen?: (id: number) => void };

export function ReleaseTicker({ games, onOpen }: ReleaseTickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="Najbliższe premiery" contentContainerClassName="gap-1.5 px-4 py-1.5">
      {games.map((game) => (
        <Pressable key={game.id} accessibilityRole="button" onPress={() => onOpen?.(game.id)} className="h-9 flex-row items-center gap-2.5 rounded-full bg-secondary px-3.5 active:opacity-80">
          <View className="size-1.5 rounded-full bg-primary" />
          <Text className="font-sans-bold text-[13px] text-foreground">{game.title}</Text>
          <Countdown to={game.releaseDate} compact />
        </Pressable>
      ))}
    </ScrollView>
  );
}
