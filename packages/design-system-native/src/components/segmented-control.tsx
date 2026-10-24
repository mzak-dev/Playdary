import { Pressable, ScrollView, Text, View } from "react-native";
import { cn } from "../lib/cn";

type SegmentedControlProps<T extends string> = {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({ items, value, onChange, label }: SegmentedControlProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={label} className="grow-0" contentContainerClassName="grow gap-1 rounded-full bg-secondary p-1">
      {items.map((item) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: item === value }}
          onPress={() => onChange(item)}
          className={cn("h-9 shrink-0 items-center justify-center rounded-full px-3 active:opacity-80", item === value && "bg-accent")}
        >
          <Text className={cn("font-sans-semibold text-sm", item === value ? "text-foreground" : "text-muted-foreground")}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
