import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { cn } from "../lib/cn";
import { useTokenColor } from "../lib/use-token-color";

const clear = (color: string) => color.replace(/[\d.]+\)$/, "0)");

export function PageHero({ children, className }: { children: ReactNode; className?: string }) {
  const glow = useTokenColor("primarySoft");

  return (
    <View className={cn("overflow-hidden px-4 pt-6 pb-10", className)}>
      <LinearGradient pointerEvents="none" colors={[glow, clear(glow)]} style={StyleSheet.absoluteFill} />
      <View className="gap-5">{children}</View>
    </View>
  );
}
