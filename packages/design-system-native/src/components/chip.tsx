import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "../lib/cn";

type ChipProps = Omit<PressableProps, "children"> & { pressed: boolean; children: string; className?: string };

export function Chip({ pressed, children, className, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: pressed }}
      className={cn("h-8 justify-center rounded-full border px-3.5 active:opacity-80", pressed ? "border-primary bg-primary" : "border-border", className)}
      {...props}
    >
      <Text className={cn("font-sans-semibold text-[13px] leading-none", pressed ? "text-primary-foreground" : "text-foreground")}>{children}</Text>
    </Pressable>
  );
}
