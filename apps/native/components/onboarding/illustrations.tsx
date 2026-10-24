import { Avatar, Countdown, GameCover, MatchRing, Rating, ScoreBadge, Tag, UserRow, useTokenColor } from "@playdary/design-system-native";
import { LISTS } from "@playdary/core";
import { Bot, Search, Sparkles } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SAMPLE_GAMES } from "./sample";

const Frame = ({ children }: { children: ReactNode }) => <View className="w-full gap-3 rounded-xl border border-border bg-card p-4">{children}</View>;

const MiniRow = ({ index }: { index: number }) => {
  const game = SAMPLE_GAMES[index]!;
  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-secondary p-2.5">
      <GameCover thumb title={game.title} cover={null} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="font-sans-semibold text-[15px] text-foreground">
          {game.title}
        </Text>
        <Text numberOfLines={1} className="font-sans text-[13px] text-muted-foreground">
          {game.genres.join(" · ")}
        </Text>
      </View>
      <ScoreBadge value={game.score} />
    </View>
  );
};

export function SearchIllustration() {
  const muted = useTokenColor("mutedForeground");
  return (
    <Frame>
      <View className="h-12 flex-row items-center gap-3 rounded-full border-[1.5px] border-primary bg-background px-4">
        <Search color={muted} size={18} />
        <Text numberOfLines={1} className="flex-1 font-sans text-[15px] text-foreground">
          kosmiczna zagadka bez walki
        </Text>
      </View>
      {[0, 1, 2].map((i) => (
        <MiniRow key={i} index={i} />
      ))}
    </Frame>
  );
}

const HISTOGRAM = [0, 0, 1, 1, 2, 3, 5, 8, 6, 3];

export function RateIllustration() {
  return (
    <Frame>
      <View className="flex-row items-center gap-3">
        <GameCover thumb title={SAMPLE_GAMES[0]!.title} cover={null} />
        <Text className="flex-1 font-sans-semibold text-base text-foreground">{SAMPLE_GAMES[0]!.title}</Text>
      </View>
      <Rating value={9} readOnly />
      <View className="gap-2 rounded-lg bg-secondary p-3">
        <Text className="font-sans-semibold text-[13px] text-muted-foreground">Twój gust</Text>
        <View className="h-20 flex-row items-end gap-1.5">
          {HISTOGRAM.map((count, i) => (
            <View key={i} className="flex-1 rounded-sm bg-rating" style={{ height: `${Math.max(8, (count / 8) * 100)}%` }} />
          ))}
        </View>
        <View className="flex-row justify-between">
          <Text className="font-sans text-xs text-muted-foreground">1</Text>
          <Text className="font-sans text-xs text-muted-foreground">10</Text>
        </View>
      </View>
    </Frame>
  );
}

const COUNTS: Record<string, number> = { playing: 3, wishlist: 18, done: 42, dropped: 5 };

export function ListsIllustration() {
  const primary = useTokenColor("primary");
  return (
    <Frame>
      <View className="gap-2">
        {LISTS.map((list, i) => (
          <View key={list.id} className="h-11 flex-row items-center justify-between rounded-full bg-secondary px-4" style={i === 1 ? { borderWidth: 1.5, borderColor: primary } : undefined}>
            <Text className="font-sans-semibold text-[15px] text-foreground">{list.label}</Text>
            <Text className="font-display text-[15px] text-muted-foreground">{COUNTS[list.id]}</Text>
          </View>
        ))}
      </View>
      <View className="items-center gap-2 rounded-lg bg-secondary p-3">
        <Text className="font-sans-semibold text-[13px] text-muted-foreground">Obserwujesz premierę</Text>
        <Countdown to={Date.now() + 12 * 86_400_000 + 5 * 3_600_000} />
      </View>
    </Frame>
  );
}

export function FriendsIllustration() {
  return (
    <Frame>
      <View className="flex-row items-center gap-4">
        <MatchRing value={0.82} />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-sans-bold text-base text-foreground">Ola</Text>
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">12 wspólnych ocen, podobny gust do Twojego</Text>
        </View>
      </View>
      <UserRow name="Kuba" subtitle="Gra teraz w Hades" actions={<Tag>Znajomy</Tag>} />
      <View className="flex-row items-center gap-3 rounded-lg bg-secondary px-4 py-3">
        <Avatar name="Marta" />
        <Text className="min-w-0 flex-1 font-sans text-[13px] leading-[18px] text-muted-foreground">
          <Text className="font-sans-bold text-foreground">Marta</Text> oceniła Outer Wilds na 10/10
        </Text>
      </View>
    </Frame>
  );
}

export function AiIllustration() {
  const primary = useTokenColor("primary");
  return (
    <Frame>
      <View className="self-end rounded-lg rounded-br-sm bg-primary px-4 py-3" style={{ maxWidth: "85%" }}>
        <Text className="font-sans-medium text-[15px] leading-[21px] text-primary-foreground">Coś krótkiego na weekend, bez walki i z dobrą fabułą</Text>
      </View>
      <View className="flex-row items-center gap-2 self-start rounded-full bg-secondary px-3 py-1.5">
        <Sparkles color={primary} size={14} />
        <Text className="font-sans-medium text-xs text-muted-foreground">Przeszukuję katalog</Text>
      </View>
      <View className="gap-3 self-start rounded-lg rounded-bl-sm bg-secondary px-4 py-3" style={{ maxWidth: "92%" }}>
        <View className="flex-row items-center gap-2">
          <Bot color={primary} size={16} />
          <Text className="font-sans-semibold text-[13px] text-muted-foreground">Asystent</Text>
        </View>
        <Text className="font-sans text-[15px] leading-[21px] text-foreground">Zacznij od Outer Wilds. Zajmuje około 20 godzin i nie ma walki.</Text>
        <MiniRow index={0} />
      </View>
    </Frame>
  );
}
