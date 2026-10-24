import { Pressable, Text, View } from "react-native";
import { cn } from "../lib/cn";

type RatingProps = { value: number; onChange?: (value: number) => void; disabled?: boolean; readOnly?: boolean };

export function Rating({ value, onChange, disabled, readOnly }: RatingProps) {
  return (
    <View className="flex-row items-center gap-3">
      <View accessibilityRole="radiogroup" accessibilityLabel="Twoja ocena" className="flex-row">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ checked: n === value, disabled }}
            accessibilityLabel={`Oceń ${n} z 10`}
            disabled={disabled || readOnly}
            onPress={() => onChange?.(n === value ? 0 : n)}
            className="h-9 w-[22px] items-center justify-center"
          >
            <View className={cn("h-2 w-4 rounded-sm", n <= value ? "bg-rating" : "bg-input")} />
          </Pressable>
        ))}
      </View>
      <Text className="min-w-12 font-display text-[15px] leading-[22px] text-foreground">{value ? `${value}/10` : "Oceń"}</Text>
    </View>
  );
}
