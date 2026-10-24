import { useTokenColor } from "@playdary/design-system-native";
import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

type SearchFieldProps = { value: string; onChangeText: (text: string) => void; onSubmit: () => void; placeholder: string; label: string };

export function SearchField({ value, onChangeText, onSubmit, placeholder, label }: SearchFieldProps) {
  const muted = useTokenColor("mutedForeground");
  return (
    <View accessibilityRole="search" className="h-[52px] flex-row items-center gap-3 rounded-full border border-border bg-secondary pr-2 pl-5">
      <Search color={muted} size={18} />
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={muted}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        className="h-full min-w-0 flex-1 font-sans-medium text-base text-foreground"
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Wyczyść" onPress={() => onChangeText("")} className="size-9 items-center justify-center rounded-full active:bg-accent">
          <X color={muted} size={18} />
        </Pressable>
      )}
    </View>
  );
}
