import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";

type UserRowProps = { name: string; subtitle?: string; actions?: ReactNode; className?: string };

export const UserRow = ({ name, subtitle, actions, className }: UserRowProps) => (
  <View className={cn("flex-row items-center gap-3.5 rounded-lg bg-secondary px-4 py-3", className)}>
    <Avatar name={name} />
    <View className="min-w-0 flex-1 gap-0.5">
      <Text numberOfLines={1} className="font-sans-semibold text-[15px] leading-[22px] text-foreground">
        {name}
      </Text>
      {subtitle && <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{subtitle}</Text>}
    </View>
    {actions && <View className="shrink-0 flex-row items-center gap-2">{actions}</View>}
  </View>
);
