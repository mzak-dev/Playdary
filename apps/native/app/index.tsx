import { Pressable, Text, View } from "react-native";

export default function SpikeScreen() {
  return (
    <View className="flex-1 justify-center gap-6 bg-background p-6">
      <View className="gap-3 rounded-lg bg-card p-6">
        <Text className="font-display text-xl text-card-foreground">Playdary</Text>
        <Text className="font-sans text-[13px] text-muted-foreground">Natywna wersja w budowie</Text>
        <Pressable className="h-10 items-center justify-center rounded-full bg-primary px-5 active:opacity-80">
          <Text className="font-sans text-sm text-primary-foreground">Obserwuj</Text>
        </Pressable>
      </View>
    </View>
  );
}
