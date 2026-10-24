import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

type RailProps = { title: string; subtitle?: string; children: ReactNode };

export function Rail({ title, subtitle, children }: RailProps) {
  return (
    <View className="min-w-0 gap-3">
      <View className="gap-1 px-4">
        <Text accessibilityRole="header" className="font-display text-2xl leading-[30px] tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle && <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{subtitle}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" accessibilityLabel={title} contentContainerClassName="gap-4 px-4 pt-1.5 pb-3.5">
        {children}
      </ScrollView>
    </View>
  );
}
