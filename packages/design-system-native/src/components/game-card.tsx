import type { Friend, Game, GameList } from "@playdary/core";
import { Check, Eye } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { cn } from "../lib/cn";
import { useTokenColor } from "../lib/use-token-color";
import { Button } from "./button";
import { Countdown } from "./countdown";
import { FriendNotice } from "./friend-notice";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";
import { ScoreBadge } from "./score-badge";

type GameCardProps = {
  game: Game;
  rank?: number;
  friend?: Friend;
  list?: GameList | null;
  following?: boolean;
  onFollow?: (following: boolean) => void;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
  className?: string;
};

export function GameCard({ game, rank, friend, list = null, following = false, onFollow, onListChange, onOpen, className }: GameCardProps) {
  const foreground = useTokenColor("foreground");
  const onPrimary = useTokenColor("primaryForeground");
  const meta = [game.genres.slice(0, 2).join(" · "), game.hypes ? `${game.hypes.toLocaleString("pl-PL")} obserwujących` : ""].filter(Boolean).join(" · ");

  return (
    <View className={cn("rounded-lg bg-card", className)}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Otwórz: ${game.title}`} onPress={onOpen} className="overflow-hidden rounded-t-lg active:opacity-90">
        <GameCover title={game.title} cover={game.cover} />
        {rank ? (
          <View className="absolute top-3 left-3 rounded-full bg-background px-2.5 py-1">
            <Text className="font-display text-[13px] leading-[18px] text-foreground">#{rank}</Text>
          </View>
        ) : null}
        {game.score !== null && (
          <View className="absolute top-3 right-3">
            <ScoreBadge value={game.score} />
          </View>
        )}
      </Pressable>
      <View className="gap-3 p-6">
        <Text accessibilityRole="header" className="font-display text-xl leading-[26px] text-card-foreground">
          {game.title}
        </Text>
        <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{meta}</Text>
        <Countdown to={game.releaseDate} compact />
        <View className="flex-row flex-wrap gap-2">
          <Button size="sm" variant={following ? "outline" : "primary"} accessibilityState={{ selected: following }} onPress={() => onFollow?.(!following)}>
            {following ? <Check color={foreground} size={16} /> : <Eye color={onPrimary} size={16} />}
            {following ? "Obserwujesz" : "Obserwuj"}
          </Button>
          <ListButton value={list} onChange={onListChange} />
        </View>
        {friend && <FriendNotice {...friend} />}
      </View>
    </View>
  );
}
