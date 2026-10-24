import { PRIVACY, PRIVACY_LABELS, THEMES, useProfile, useUpdateProfile, type Notifications, type Session } from "@playdary/core";
import { Button, SegmentedControl, Switch, TextField } from "@playdary/design-system-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { signOut } from "../../lib/auth";
import { setTheme, usePolishQuotes, useTheme } from "../../lib/settings";
import { supabase } from "../../lib/supabase";
import { Muted, Panel } from "../panel";

const NOTIFICATION_ROWS: { key: keyof Notifications; label: string; description: string }[] = [
  { key: "friends", label: "Aktywność znajomych", description: "Gdy znajomy obserwuje lub ocenia grę z Twoich list." },
  { key: "release", label: "Premiery obserwowanych gier", description: "Przypomnienie przed premierą gry, którą obserwujesz." },
  { key: "digest", label: "Podsumowanie tygodnia", description: "Raz w tygodniu e-mailem." },
];

const saveErrorText = (error: { code?: string; message: string }) => {
  if (error.code === "23505") return "Ta nazwa użytkownika jest już zajęta.";
  if (error.code === "23514") return "Nazwa użytkownika musi mieć od 3 do 32 znaków.";
  return error.message;
};

const Label = ({ children }: { children: string }) => <Text className="font-sans-semibold text-[13px] leading-4 text-muted-foreground">{children}</Text>;

type SettingsProps = { session: Session; userId: string; username: string };

export function Settings({ session, userId, username }: SettingsProps) {
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);
  const theme = useTheme();
  const [polishQuotes, setPolishQuotes] = usePolishQuotes();
  const currentEmail = session.user.email ?? "";
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftEmail, setDraftEmail] = useState(currentEmail);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const notifications = profile.data?.notifications;
  const privacy = profile.data?.privacy;

  const saveAccount = async () => {
    setBusy(true);
    setMessage(null);
    const name = draftUsername.trim();
    const email = draftEmail.trim();
    try {
      if (name !== username) await update.mutateAsync({ username: name });
      if (email !== currentEmail) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
        setMessage({ text: "Zapisano zmiany. Potwierdź nowy adres e-mail w wiadomości, którą wysłaliśmy.", error: false });
      } else {
        setMessage({ text: "Zapisano zmiany", error: false });
      }
    } catch (error) {
      setMessage({ text: saveErrorText(error as { code?: string; message: string }), error: true });
    }
    setBusy(false);
  };

  return (
    <View className="gap-6">
      <Panel title="Konto">
        <View className="gap-5">
          <TextField label="Nazwa użytkownika" autoCapitalize="none" autoCorrect={false} maxLength={32} value={draftUsername} onChangeText={setDraftUsername} />
          <TextField label="E-mail" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={draftEmail} onChangeText={setDraftEmail} />
          <Button disabled={busy} onPress={saveAccount}>
            Zapisz zmiany
          </Button>
          {message && (
            <Text accessibilityRole={message.error ? "alert" : "text"} className={message.error ? "font-sans-semibold text-sm text-destructive" : "font-sans-semibold text-sm text-success"}>
              {message.text}
            </Text>
          )}
        </View>
      </Panel>

      <Panel title="Wygląd">
        <Label>Motyw</Label>
        <SegmentedControl label="Motyw" items={THEMES} value={theme} onChange={setTheme} />
        <View className="flex-row items-center justify-between gap-4 border-t border-border pt-4">
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-sans-semibold text-[15px] leading-[22px] text-foreground">Polskie cytaty</Text>
            <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">Dodaje do cytatów na stronie głównej kwestie z polskich gier i dubbingów, także z wulgaryzmami. Ustawienie dotyczy tej aplikacji.</Text>
          </View>
          <Switch label="Polskie cytaty" checked={polishQuotes} onChange={setPolishQuotes} />
        </View>
      </Panel>

      <Panel title="Powiadomienia">
        <View>
          {NOTIFICATION_ROWS.map((row, i) => (
            <View key={row.key} className={`flex-row items-center justify-between gap-4 py-3 ${i === 0 ? "pt-0" : "border-t border-border"} ${i === NOTIFICATION_ROWS.length - 1 ? "pb-0" : ""}`}>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="font-sans-semibold text-[15px] leading-[22px] text-foreground">{row.label}</Text>
                <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{row.description}</Text>
              </View>
              <Switch label={row.label} checked={notifications?.[row.key] ?? false} onChange={(checked) => notifications && update.mutate({ notifications: { ...notifications, [row.key]: checked } })} />
            </View>
          ))}
        </View>
      </Panel>

      <Panel title="Prywatność">
        <Label>Kto widzi moje listy i oceny</Label>
        <SegmentedControl label="Widoczność list" items={PRIVACY_LABELS} value={PRIVACY_LABELS.find((label) => PRIVACY[label] === privacy) ?? ""} onChange={(label) => update.mutate({ privacy: PRIVACY[label] })} />
      </Panel>

      <Panel title="Sesja">
        <Muted>Zalogowano jako {currentEmail}.</Muted>
        <View className="flex-row">
          <Button variant="outline" onPress={() => void signOut()}>
            Wyloguj się
          </Button>
        </View>
      </Panel>
    </View>
  );
}
