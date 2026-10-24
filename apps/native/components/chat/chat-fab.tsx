import { useTokenColor } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function ChatFab({ bottom }: { bottom: number }) {
  const router = useRouter();
  const primary = useTokenColor("primary");

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Otwórz asystenta AI"
        onPress={() => router.push("/chat")}
        className="absolute right-4 h-[52px] flex-row items-center gap-2.5 rounded-full border border-border bg-popover pr-5 pl-4 shadow-pop active:opacity-80"
        style={{ bottom }}
      >
        <Sparkles color={primary} size={20} />
        <Text className="font-sans-bold text-sm text-popover-foreground">Zapytaj AI</Text>
      </Pressable>
    </View>
  );
}
