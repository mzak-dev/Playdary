import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({ title, children }: { title: string; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 px-4 pb-8" contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <Text accessibilityRole="header" className="font-display-extrabold text-3xl text-foreground">
        {title}
      </Text>
      <View className="gap-4">{children}</View>
    </ScrollView>
  );
}
