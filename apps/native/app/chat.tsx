import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, type ComponentRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatHeader } from "../components/chat/chat-header";
import { Composer } from "../components/chat/composer";
import { Reply } from "../components/chat/reply";
import { SUGGESTIONS } from "../components/chat/text";
import { useChat } from "../lib/chat";

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const { messages, status, remaining, hydrated, send, stop, clear } = useChat();
  const body = useRef<ComponentRef<typeof ScrollView>>(null);
  const sentPrompt = useRef<string | undefined>(undefined);
  const streaming = status === "streaming" || status === "fallback";

  useEffect(() => {
    if (!prompt || !hydrated || sentPrompt.current === prompt) return;
    sentPrompt.current = prompt;
    void send(prompt);
    router.setParams({ prompt: undefined });
  }, [prompt, hydrated, send, router]);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const openGame = (id: number) => router.push(`/games/${id}`);
  const plainSearch = () => router.dismissTo("/search");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background" style={{ paddingTop: Math.max(insets.top, 12) }}>
      <ChatHeader status={status} onClear={clear} onClose={close} />
      <ScrollView ref={body} className="flex-1" contentContainerClassName="grow gap-[18px] p-4" keyboardShouldPersistTaps="handled" onContentSizeChange={() => body.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 && (
          <View className="my-auto items-start gap-2">
            <Text accessibilityRole="header" className="font-display-extrabold text-2xl leading-[30px] tracking-tight text-foreground">
              Zapytaj Playdary
            </Text>
            <Text className="font-sans text-sm leading-[22px] text-muted-foreground">Odpowiadam na podstawie bazy gier: premiery, oceny, gatunki i Twoje listy.</Text>
            <View className="mt-3 items-start gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Pressable key={suggestion} accessibilityRole="button" onPress={() => void send(suggestion)} className="rounded-full border border-border bg-card px-3.5 py-2.5 active:opacity-80">
                  <Text className="font-sans-medium text-[13px] leading-[18px] text-foreground">{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {messages.map((message) =>
          message.role === "user" ? (
            <View key={message.id} className="items-end">
              <View className="max-w-[85%] rounded-[18px] rounded-br-[4px] border border-border bg-muted px-3.5 py-2.5">
                <Text selectable className="font-sans text-sm leading-[21px] text-foreground">
                  {message.content}
                </Text>
              </View>
            </View>
          ) : (
            <Reply key={message.id} message={message} onOpenGame={openGame} onSearch={plainSearch} />
          ),
        )}
      </ScrollView>
      <Composer streaming={streaming} locked={status === "limit"} onSend={(text) => void send(text)} onStop={stop} />
      <Text className="px-4 pt-2 text-center font-sans text-[11px] leading-[14px] text-muted-foreground" style={{ paddingBottom: insets.bottom + 8 }}>
        Odpowiedzi generuje model AI na podstawie bazy. Mogą zawierać błędy.
        {remaining !== null ? ` Pozostało pytań dziś: ${remaining}.` : ""}
      </Text>
    </KeyboardAvoidingView>
  );
}
