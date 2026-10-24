import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "../lib/cn";

type ChipProps = Omit<PressableProps, "children"> & { pressed: boolean; children: string; count?: number; className?: string };

export function Chip({ pressed, children, count, className, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: pressed }}
      className={cn("h-8 flex-row items-center justify-center rounded-full border px-3.5 active:opacity-80", pressed ? "border-primary bg-primary" : "border-border", count === 0 && "opacity-40", className)}
      {...props}
    >
      <Text className={cn("font-sans-semibold text-[13px] leading-none", pressed ? "text-primary-foreground" : "text-foreground")}>{children}</Text>
      {count !== undefined && <Text className={cn("ml-1.5 font-sans text-[11px] leading-none opacity-60", pressed ? "text-primary-foreground" : "text-foreground")}>{count}</Text>}
    </Pressable>
  );
}
