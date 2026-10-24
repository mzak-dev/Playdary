import { Text, View } from "react-native";
import { cn } from "../lib/cn";

type AvatarProps = { name: string; size?: "sm" | "md" | "lg"; status?: "playing"; className?: string };

const SIZES = {
  sm: { box: "size-[26px]", text: "font-sans-bold text-[11px]" },
  md: { box: "size-10", text: "font-sans-bold text-sm" },
  lg: { box: "size-24", text: "font-display-extrabold text-[40px] leading-[44px]" },
};

export function Avatar({ name, size = "md", status, className }: AvatarProps) {
  const { box, text } = SIZES[size];
  return (
    <View accessibilityElementsHidden className={cn("shrink-0", className)}>
      <View className={cn("items-center justify-center rounded-full bg-accent", box)}>
        <Text className={cn("text-accent-foreground", text)}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      {status && <View className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-success" />}
    </View>
  );
}
