import { LISTS, type GameList } from "@playdary/core";
import { Check, Plus } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokenColor } from "../lib/use-token-color";
import { Button } from "./button";

type ListButtonProps = { value: GameList | null; onChange?: (value: GameList | null) => void; size?: "sm" | "md" };

export function ListButton({ value, onChange, size = "sm" }: ListButtonProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const color = useTokenColor("foreground");
  const current = LISTS.find((list) => list.id === value);

  const pick = (id: GameList) => {
    setOpen(false);
    onChange?.(id === value ? null : id);
  };

  return (
    <>
      <Button size={size} variant={current ? "outline" : "secondary"} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)}>
        {current ? <Check color={color} size={16} /> : <Plus color={color} size={16} />}
        {current ? current.label : "Dodaj do listy"}
      </Button>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Zamknij" onPress={() => setOpen(false)} className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
          <View className="rounded-t-lg bg-popover px-3 pt-4" style={{ paddingBottom: insets.bottom + 12 }}>
            <Text className="px-3 pb-2 font-sans-semibold text-[13px] text-muted-foreground">Dodaj do listy</Text>
            {LISTS.map((list) => (
              <Pressable
                key={list.id}
                accessibilityRole="menuitem"
                accessibilityState={{ checked: list.id === value }}
                onPress={() => pick(list.id)}
                className="flex-row items-center justify-between gap-3 rounded-md px-3 py-3.5 active:bg-accent"
              >
                <Text className="font-sans-medium text-base text-popover-foreground">{list.label}</Text>
                {list.id === value && <Check color={color} size={18} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
