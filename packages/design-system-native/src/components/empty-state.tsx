import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Tag } from "./tag";

type EmptyStateProps = { label: string; title: string; text: string; action?: ReactNode };

export function EmptyState({ label, title, text, action }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-xl border border-border bg-card px-7 pt-7 pb-6">
      <Tag>{label}</Tag>
      <Text className="text-center font-display text-[22px] leading-7 text-foreground">{title}</Text>
      <Text className="mb-1 text-center font-sans text-sm leading-[22px] text-muted-foreground">{text}</Text>
      {action}
    </View>
  );
}
