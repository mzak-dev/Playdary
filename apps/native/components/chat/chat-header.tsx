import type { AiStatus } from "@playdary/core";
import { useTokenColor } from "@playdary/design-system-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Trash2, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { STATUS_LABEL } from "./text";

const DOT: Record<"ok" | "busy" | "warn" | "down", string> = { ok: "bg-success", busy: "bg-primary", warn: "bg-highlight", down: "bg-destructive" };

type ChatHeaderProps = { status: AiStatus; onClear: () => void; onClose: () => void };

export function ChatHeader({ status, onClear, onClose }: ChatHeaderProps) {
  const primary = useTokenColor("primary");
  const muted = useTokenColor("mutedForeground");
  const state = STATUS_LABEL[status];

  return (
    <View className="flex-row items-center gap-3 border-b border-border px-4 pt-3 pb-3">
      <LinearGradient colors={[primary, "#8b5cf6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
        <Sparkles color="#ffffff" size={18} />
      </LinearGradient>
      <View className="min-w-0 flex-1">
        <Text accessibilityRole="header" className="font-display text-[15px] leading-5 text-foreground">
          Asystent Playdary
        </Text>
        <View accessibilityLiveRegion="polite" className="flex-row items-center gap-1.5">
          <View className={`size-[7px] rounded-full ${DOT[state.tone]}`} />
          <Text className="font-sans-medium text-xs leading-4 text-muted-foreground">{state.text}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Wyczyść rozmowę" onPress={onClear} className="size-10 items-center justify-center rounded-full active:bg-accent">
        <Trash2 color={muted} size={18} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Zamknij czat" onPress={onClose} className="size-10 items-center justify-center rounded-full active:bg-accent">
        <X color={muted} size={20} />
      </Pressable>
    </View>
  );
}
