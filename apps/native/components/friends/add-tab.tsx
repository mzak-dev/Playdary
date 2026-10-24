import { mutualLabel, useProfile, useSearchUsers } from "@playdary/core";
import { Button, Skeleton, TextField, UserRow } from "@playdary/design-system-native";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Share, Text, View } from "react-native";
import { inviteLink } from "../../lib/invite";
import { useDebounced } from "../../lib/use-debounced";
import { ErrorText, Muted, Panel, SectionHeading } from "../panel";
import { UserActions } from "../user-actions";

export function AddTab({ userId }: { userId: string }) {
  const profile = useProfile(userId);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed);
  const results = useSearchUsers(debounced);
  const link = profile.data ? inviteLink(profile.data.username) : "";

  const copy = async () => {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <View className="gap-8">
      <View className="gap-3.5">
        <SectionHeading>Znajdź po nazwie użytkownika</SectionHeading>
        <TextField label="Nazwa użytkownika" autoCapitalize="none" autoCorrect={false} placeholder="Wpisz nazwę, np. mateo" value={query} onChangeText={setQuery} />
        {trimmed.length < 2 && <Muted>Wpisz co najmniej dwa znaki, żeby wyszukać.</Muted>}
        {trimmed.length >= 2 && (results.isFetching || trimmed !== debounced) && !results.data && <Skeleton className="h-16 rounded-lg" />}
        {results.error && <ErrorText>Nie udało się wyszukać: {results.error.message}</ErrorText>}
        {trimmed === debounced && results.data?.length === 0 && <Muted>Nie znaleziono nikogo o takiej nazwie.</Muted>}
        {results.data?.map((user) => (
          <UserRow key={user.id} name={user.username} subtitle={user.mutual > 0 ? mutualLabel(user.mutual) : undefined} actions={<UserActions userId={userId} user={user} />} />
        ))}
      </View>

      <Panel title="Twój link zaproszenia">
        <Muted>Wyślij link znajomemu. Po otwarciu zobaczy Twój profil i będzie mógł Cię dodać.</Muted>
        <View className="rounded-md bg-background px-4 py-3">
          <Text className="font-sans text-[13px] leading-5 text-foreground">{link || "…"}</Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-2">
          <Button size="sm" onPress={copy} disabled={!link}>
            Kopiuj link
          </Button>
          <Button variant="secondary" size="sm" disabled={!link} onPress={() => void Share.share({ message: link })}>
            Udostępnij
          </Button>
          {copied && (
            <Text accessibilityRole="alert" className="font-sans-semibold text-[13px] leading-[18px] text-success">
              Skopiowano
            </Text>
          )}
        </View>
      </Panel>
    </View>
  );
}
