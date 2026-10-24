import { Text, View } from "react-native";

export function MatchMeter({ value }: { value: number | null }) {
  if (value === null) return <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">Brak wspólnych ocen</Text>;
  const percent = Math.round(value * 100);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-baseline justify-between gap-2">
        <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">Zgodność gustu</Text>
        <Text className="font-sans-bold text-[13px] leading-[18px] text-foreground">{percent}%</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} className="h-1.5 overflow-hidden rounded-full bg-input-soft">
        <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
