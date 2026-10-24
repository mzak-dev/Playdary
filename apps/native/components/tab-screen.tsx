import { PageHero } from "@playdary/design-system-native";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabScreenProps = { title: string; hero?: ReactNode; children?: ReactNode };

export function TabScreen({ title, hero, children }: TabScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-28" keyboardShouldPersistTaps="handled">
      <View style={{ paddingTop: insets.top }}>
        <PageHero>
          <Text accessibilityRole="header" className="font-display-extrabold text-[36px] leading-[40px] tracking-tight text-foreground">
            {title}
          </Text>
          {hero}
        </PageHero>
      </View>
      <View className="gap-8 px-4 pt-2">{children}</View>
    </ScrollView>
  );
}
