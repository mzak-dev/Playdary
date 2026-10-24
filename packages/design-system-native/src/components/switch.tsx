import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import { cn } from "../lib/cn";

type SwitchProps = { checked: boolean; onChange: (checked: boolean) => void; label: string };

export function Switch({ checked, onChange, label }: SwitchProps) {
  const offset = useRef(new Animated.Value(checked ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(offset, { toValue: checked ? 20 : 0, useNativeDriver: true, bounciness: 8 }).start();
  }, [checked, offset]);

  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked }} accessibilityLabel={label} onPress={() => onChange(!checked)} className={cn("h-7 w-12 shrink-0 justify-center rounded-full", checked ? "bg-primary" : "bg-input")}>
      <Animated.View className="ml-[3px] size-[22px] rounded-full bg-background" style={{ transform: [{ translateX: offset }] }} />
    </Pressable>
  );
}
