import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-5 rounded-lg bg-secondary p-6">
      <Text accessibilityRole="header" className="font-display text-xl leading-[26px] text-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

export const SectionHeading = ({ children }: { children: string }) => (
  <Text accessibilityRole="header" className="font-display text-2xl leading-[30px] tracking-tight text-foreground">
    {children}
  </Text>
);

export const Muted = ({ children }: { children: ReactNode }) => <Text className="font-sans text-sm leading-[21px] text-muted-foreground">{children}</Text>;

export const ErrorText = ({ children }: { children: ReactNode }) => (
  <Text accessibilityRole="alert" className="font-sans-medium text-sm text-destructive">
    {children}
  </Text>
);
