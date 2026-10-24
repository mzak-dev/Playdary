import type { ActivityKind } from "@playdary/core";
import { Pressable, Text, View } from "react-native";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";
import { GameCover } from "./game-cover";

type ActivityItemProps = {
  name: string;
  when: string;
  kind: ActivityKind;
  score?: number | null;
  game: { title: string; cover: string | null };
  onOpen?: () => void;
};

const KINDS: Record<ActivityKind, { label: string; badge: string; text: string }> = {
  rated: { label: "Ocena", badge: "bg-rating-soft", text: "text-rating" },
  done: { label: "Ukończono", badge: "bg-success-soft", text: "text-success" },
  follow: { label: "Obserwuje", badge: "bg-primary-soft", text: "text-primary" },
  wish: { label: "Chce zagrać", badge: "bg-primary-soft", text: "text-primary" },
};

export function ActivityItem({ name, when, kind, score, game, onOpen }: ActivityItemProps) {
  const { label, badge, text } = KINDS[kind];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${name}: ${label} ${game.title}`} onPress={onOpen} className="flex-row items-center gap-3.5 rounded-lg px-3 py-2.5 active:bg-secondary">
      <Avatar name={name} />
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-baseline gap-x-2">
          <Text className="font-sans-bold text-[15px] leading-[22px] text-foreground">{name}</Text>
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{when}</Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <View className={cn("rounded-full px-2.5 py-0.5", badge)}>
            <Text className={cn("font-sans-semibold text-xs leading-[18px]", text)}>{kind === "rated" && score ? `Ocena ${score}/10` : label}</Text>
          </View>
          <Text className="shrink font-sans-medium text-sm leading-5 text-foreground">{game.title}</Text>
        </View>
      </View>
      <GameCover thumb title={game.title} cover={game.cover} />
    </Pressable>
  );
}
