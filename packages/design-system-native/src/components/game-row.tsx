import type { Friend, Game, GameList } from "@playdary/core";
import { Pressable, Text, View } from "react-native";
import { cn } from "../lib/cn";
import { formatDate } from "../lib/format";
import { FriendNotice } from "./friend-notice";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";
import { ScoreBadge } from "./score-badge";

type GameRowProps = {
  game: Game;
  friend?: Friend;
  list?: GameList | null;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
  className?: string;
};

export function GameRow({ game, friend, list = null, onListChange, onOpen, className }: GameRowProps) {
  return (
    <View className={cn("gap-3 rounded-lg px-4 py-3", className)}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Otwórz: ${game.title}`} onPress={onOpen} className="flex-row items-center gap-4 active:opacity-80">
        <GameCover thumb title={game.title} cover={game.cover} />
        <View className="min-w-0 flex-1 items-start gap-1">
          <Text className="font-sans-semibold text-base leading-[22px] text-foreground">{game.title}</Text>
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{[game.platforms.slice(0, 3).join(", "), game.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}</Text>
        </View>
        <ScoreBadge value={game.score} />
      </Pressable>
      {friend && <FriendNotice {...friend} />}
      <View className="flex-row items-center justify-between gap-3">
        <ListButton value={list} onChange={onListChange} />
        {game.releaseDate ? <Text className="font-sans-medium text-[13px] leading-[18px] text-muted-foreground">{formatDate(game.releaseDate)}</Text> : null}
      </View>
    </View>
  );
}
