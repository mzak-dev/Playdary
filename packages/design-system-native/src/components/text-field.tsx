import { Text, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "../lib/cn";
import { useTokenColor } from "../lib/use-token-color";

type TextFieldProps = TextInputProps & { label: string; className?: string };

export function TextField({ label, className, ...props }: TextFieldProps) {
  const placeholderColor = useTokenColor("mutedForeground");

  return (
    <View className="gap-2">
      <Text className="font-sans-semibold text-[13px] leading-4 text-foreground">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={placeholderColor}
        className={cn("h-12 rounded-md border-[1.5px] border-input bg-background px-4 font-sans text-base text-foreground focus:border-primary", className)}
        {...props}
      />
    </View>
  );
}
