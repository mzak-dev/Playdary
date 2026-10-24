import { igdbImage } from "@playdary/core";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { cn } from "../lib/cn";

const TONES = ["bg-cover-ember", "bg-cover-teal", "bg-cover-rose", "bg-cover-lime", "bg-cover-sky"];

const toneFor = (title: string) => {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return TONES[hash % TONES.length];
};

const initials = (title: string) =>
  title
    .split(" ")
    .filter((word) => /^[\p{L}\d]/u.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

type GameCoverProps = { title: string; cover: string | null; thumb?: boolean; className?: string };

export function GameCover({ title, cover, thumb = false, className }: GameCoverProps) {
  const shape = thumb ? "h-[60px] w-[88px] shrink-0 rounded-md" : "aspect-[16/10] w-full";

  if (cover) {
    return (
      <Image
        source={{ uri: igdbImage(cover, thumb ? "t_cover_small" : "t_cover_big_2x") }}
        accessibilityLabel={`Okładka: ${title}`}
        contentFit="cover"
        contentPosition="top"
        transition={150}
        className={cn(shape, "overflow-hidden bg-secondary", className)}
      />
    );
  }

  return (
    <View accessibilityRole="image" accessibilityLabel={`Okładka: ${title}`} className={cn(shape, "flex-row overflow-hidden", toneFor(title), thumb ? "items-center justify-center" : "items-end p-4", className)}>
      <Text className={cn("font-display-extrabold leading-none tracking-tight text-highlight-foreground", thumb ? "text-lg" : "max-w-[220px] text-[26px]")}>{thumb ? initials(title) : title}</Text>
    </View>
  );
}
