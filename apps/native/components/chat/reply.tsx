import { igdbImage, type AiMessage } from "@playdary/core";
import { ChatMarkdown, useTokenColor } from "@playdary/design-system-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { Database } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { TypingDots } from "./typing-dots";
import { TOOL_LABEL, cardSubtitle, plural, seconds } from "./text";

type ReplyProps = { message: AiMessage; onOpenGame: (id: number) => void; onSearch: () => void };

function Note({ message, onSearch }: Pick<ReplyProps, "message" | "onSearch">) {
  const note = (text: string) => (
    <View className="gap-2 self-stretch rounded-[14px] border border-border bg-card px-3.5 py-2.5">
      <Text className="font-sans text-[13px] leading-5 text-foreground">{text}</Text>
    </View>
  );

  if (message.state === "limit") return note("Wykorzystano dzienny limit pytań do asystenta. Odnowi się jutro.");
  if (message.state === "interrupted") return note("Odpowiedź urwała się w połowie. Zadaj pytanie ponownie.");
  if (message.state === "stopped") return <Text className="font-sans-medium text-[11px] leading-[14px] text-muted-foreground">Zatrzymano</Text>;
  if (message.state === "unavailable") {
    return (
      <View className="items-start gap-2 self-stretch rounded-[14px] border border-border bg-card px-3.5 py-2.5">
        <Text className="font-sans text-[13px] leading-5 text-foreground">Asystent jest chwilowo niedostępny. Możesz skorzystać ze zwykłego wyszukiwania.</Text>
        <Pressable accessibilityRole="button" onPress={onSearch} className="rounded-full bg-primary px-3.5 py-1.5 active:opacity-80">
          <Text className="font-sans-bold text-[13px] leading-[18px] text-primary-foreground">Zwykłe wyszukiwanie</Text>
        </Pressable>
      </View>
    );
  }
  return null;
}

export function Reply({ message, onOpenGame, onSearch }: ReplyProps) {
  const primary = useTokenColor("primary");
  const muted = useTokenColor("mutedForeground");
  const [copied, setCopied] = useState(false);
  const streaming = message.state === "streaming";
  const running = message.tools.find((tool) => tool.state === "running");
  const finished = message.tools.filter((tool) => tool.state === "done");
  const found = finished.reduce((sum, tool) => sum + (tool.count ?? 0), 0);

  const copy = async () => {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="items-start gap-2.5">
      {finished.length > 0 && (
        <View className="flex-row items-center gap-2 self-stretch rounded-xl border border-border bg-card px-3 py-2">
          <Database color={muted} size={14} />
          <Text className="font-sans-medium text-xs leading-4 text-muted-foreground">Zapytanie do bazy · {plural(found)}</Text>
        </View>
      )}
      {running && (
        <View className="flex-row items-center gap-2 self-stretch rounded-xl border border-border bg-card px-3 py-2">
          <ActivityIndicator size="small" color={primary} />
          <Text className="font-sans-medium text-xs leading-4 text-muted-foreground">{TOOL_LABEL[running.name] ?? "Przeszukuję bazę…"}</Text>
        </View>
      )}
      {message.content ? (
        <Pressable accessibilityHint="Przytrzymaj, aby skopiować odpowiedź" onLongPress={copy} className="self-stretch">
          <ChatMarkdown>{message.content}</ChatMarkdown>
        </Pressable>
      ) : null}
      {streaming && !running && !message.content && <TypingDots />}
      {message.cards.length > 0 && (
        <View className="gap-1.5 self-stretch">
          {message.cards.map((card) => (
            <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`Zobacz grę: ${card.name}`} onPress={() => onOpenGame(card.id)} className="flex-row items-center gap-3 rounded-[14px] border border-border bg-card py-2 pr-3 pl-2 active:opacity-80">
              <View className="h-[52px] w-10 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {card.cover ? <Image source={{ uri: igdbImage(card.cover, "t_cover_small") }} contentFit="cover" style={{ width: 40, height: 52 }} /> : <Text className="font-display-extrabold text-sm text-muted-foreground">{card.name.charAt(0)}</Text>}
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text numberOfLines={2} className="font-display text-sm leading-[18px] text-foreground">
                  {card.name}
                </Text>
                <Text className="font-sans text-xs leading-4 text-muted-foreground">{cardSubtitle(card)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <Note message={message} onSearch={onSearch} />
      {message.state === "done" && message.model && (
        <Text className="font-sans-medium text-[11px] leading-[14px] text-muted-foreground">
          {message.model.label}
          {message.model.fallback ? " (zapasowy)" : ""}
          {message.ms ? ` · ${seconds(message.ms)}` : ""}
          {copied ? " · Skopiowano" : ""}
        </Text>
      )}
      {copied && message.state !== "done" && <Text className="font-sans-medium text-[11px] leading-[14px] text-success">Skopiowano</Text>}
    </View>
  );
}
