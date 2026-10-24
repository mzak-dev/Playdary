import type { Quote } from "@playdary/core";
import { Shuffle } from "lucide-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useTokenColor } from "../lib/use-token-color";
import { Button } from "./button";
import { PageHero } from "./page-hero";

type QuoteHeroProps = { user: string; quotes: Quote[]; interval?: number; onOpenGame?: () => void; children?: ReactNode };

export function QuoteHero({ user, quotes, interval = 9000, onOpenGame, children }: QuoteHeroProps) {
  const [index, setIndex] = useState(0);
  const reveal = useRef(new Animated.Value(0)).current;
  const muted = useTokenColor("mutedForeground");
  const quote = quotes[index % quotes.length];
  const showNext = () => setIndex((n) => (n + 1) % quotes.length);
  const showRandom = () => setIndex((n) => (n + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length);

  useEffect(() => {
    if (quotes.length < 2) return;
    const id = setInterval(showNext, interval);
    return () => clearInterval(id);
  }, [quotes.length, interval, index]);

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, { toValue: 1, duration: 650, useNativeDriver: true }).start();
  }, [index, reveal]);

  if (!quote) return null;

  return (
    <PageHero>
      <Text className="font-sans-medium text-sm leading-5 text-muted-foreground">
        Witaj, <Text className="font-sans-bold text-primary">{user}</Text>
      </Text>
      <Animated.Text
        accessibilityRole="header"
        className="font-display-extrabold text-[38px] leading-[40px] tracking-tight text-foreground"
        style={{ opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}
      >
        {quote.text}
      </Animated.Text>
      <View className="flex-row flex-wrap items-center gap-x-6 gap-y-4">
        <View className="flex-row items-center gap-2.5">
          <View className="h-[3px] w-7 rounded-sm bg-foreground" />
          <Text className="font-sans-semibold text-sm leading-5 text-muted-foreground">
            {quote.game} · {quote.year}
          </Text>
        </View>
        <Button variant="secondary" onPress={onOpenGame}>
          Zobacz grę
        </Button>
        {quotes.length > 1 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Losuj cytat" onPress={showRandom} className="size-8 items-center justify-center opacity-60 active:opacity-100">
            <Shuffle color={muted} size={16} />
          </Pressable>
        )}
      </View>
      {children}
    </PageHero>
  );
}
