import { useTokenColor } from "@playdary/design-system-native";
import { ArrowUp, Square } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

type ComposerProps = { streaming: boolean; locked: boolean; onSend: (text: string) => void; onStop: () => void };

export function Composer({ streaming, locked, onSend, onStop }: ComposerProps) {
  const [draft, setDraft] = useState("");
  const muted = useTokenColor("mutedForeground");
  const onPrimary = useTokenColor("primaryForeground");
  const canSend = draft.trim().length > 0 && !locked;

  const submit = () => {
    if (streaming) return onStop();
    if (!canSend) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <View className="mx-3 flex-row items-end gap-2 rounded-[24px] border border-border bg-secondary py-1.5 pr-1.5 pl-4">
      <TextInput
        accessibilityLabel="Wiadomość do asystenta"
        value={draft}
        onChangeText={setDraft}
        editable={!locked}
        multiline
        maxLength={2000}
        placeholder="Zapytaj o gry, premiery, swoje listy…"
        placeholderTextColor={muted}
        className="max-h-[120px] min-h-9 flex-1 py-1.5 font-sans text-[15px] leading-5 text-foreground"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={streaming ? "Zatrzymaj" : "Wyślij"}
        disabled={!streaming && !canSend}
        onPress={submit}
        className={`size-9 items-center justify-center rounded-full bg-primary active:opacity-80 ${!streaming && !canSend ? "opacity-40" : ""}`}
      >
        {streaming ? <Square color={onPrimary} fill={onPrimary} size={14} /> : <ArrowUp color={onPrimary} size={18} />}
      </Pressable>
    </View>
  );
}
