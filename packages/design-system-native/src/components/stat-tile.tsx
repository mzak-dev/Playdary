import { Text, View } from "react-native";

type StatTileProps = { value: string; label: string };

export const StatTile = ({ value, label }: StatTileProps) => (
  <View className="min-w-24 flex-1 gap-0.5 rounded-md bg-secondary px-3 py-3">
    <Text className="font-display text-xl leading-[26px] text-foreground">{value}</Text>
    <Text className="font-sans-medium text-xs leading-4 text-muted-foreground">{label}</Text>
  </View>
);
