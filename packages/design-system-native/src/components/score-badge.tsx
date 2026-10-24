import { Text, View } from "react-native";
import { cn } from "../lib/cn";

const band = (score: number) =>
  score >= 75 ? "bg-success" : score >= 50 ? "bg-highlight" : "bg-destructive";

const bandText = (score: number) =>
  score >= 75 ? "text-success-foreground" : score >= 50 ? "text-highlight-foreground" : "text-destructive-foreground";

export function ScoreBadge({ value }: { value: number | null }) {
  const rounded = value === null ? null : Math.round(value);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={rounded === null ? "Brak oceny" : `Ocena ${rounded} na 100`}
      className={cn("size-10 items-center justify-center rounded-full", rounded === null ? "bg-secondary" : band(rounded))}
    >
      <Text className={cn("font-display-extrabold text-[15px]", rounded === null ? "text-muted-foreground" : bandText(rounded))}>{rounded ?? "–"}</Text>
    </View>
  );
}
