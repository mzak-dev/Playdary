import type { Game, GameList } from "@playdary/core";
import { Text, View } from "react-native";
import { cn } from "../lib/cn";
import { GameRow } from "./game-row";

type RatedGameRowProps = {
  game: Game;
  score: number;
  list?: GameList | null;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
};

export function RatedGameRow({ game, score, list, onListChange, onOpen }: RatedGameRowProps) {
  return (
    <View className="overflow-hidden rounded-xl border border-border bg-card">
      <GameRow game={game} list={list} onListChange={onListChange} onOpen={onOpen} />
      <View accessibilityRole="image" accessibilityLabel={`Twoja ocena: ${score} z 10`} className="flex-row items-center gap-4 px-4 pb-4">
        <View className="flex-row items-baseline gap-0.5">
          <Text className="font-display text-[32px] leading-8 text-rating">{score}</Text>
          <Text className="font-display text-sm text-muted-foreground">/10</Text>
        </View>
        <View accessibilityElementsHidden className="flex-row gap-[3px]">
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} className={cn("h-5 w-1.5 rounded-sm", i < score ? "bg-rating" : "bg-input")} />
          ))}
        </View>
      </View>
    </View>
  );
}
