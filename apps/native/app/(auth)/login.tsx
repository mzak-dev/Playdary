import { Button, SegmentedControl, TextField } from "@playdary/design-system-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { errorText, signIn, signInWithProvider, signUp } from "../../lib/auth";

const MODES = ["Zaloguj się", "Załóż konto"] as const;
type Mode = (typeof MODES)[number];

export default function Login() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("Zaloguj się");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signingUp = mode === "Załóż konto";

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = signingUp ? await signUp(email, password, username) : await signIn(email, password);
    setBusy(false);
    if (result.error) return setError(errorText(result.error.message));
    if (!result.data.session) setNotice("Sprawdź skrzynkę i potwierdź adres e-mail, a potem się zaloguj.");
  };

  const signInWith = async (provider: "google" | "discord") => {
    setError(null);
    const { error: providerError } = await signInWithProvider(provider);
    if (providerError) setError(providerError);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="grow justify-center px-4" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
        <View className="gap-5 rounded-lg bg-card p-8">
          <Text accessibilityRole="header" className="font-display-extrabold text-4xl leading-[44px] tracking-tight text-card-foreground">
            Playdary
          </Text>
          <SegmentedControl label="Tryb" items={MODES} value={mode} onChange={setMode} />
          <TextField label="E-mail" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} />
          {signingUp && <TextField label="Nazwa użytkownika" autoCapitalize="none" autoComplete="username" maxLength={32} value={username} onChangeText={setUsername} />}
          <TextField label="Hasło" secureTextEntry autoCapitalize="none" autoComplete={signingUp ? "new-password" : "current-password"} value={password} onChangeText={setPassword} />
          {error && (
            <Text accessibilityRole="alert" className="font-sans-medium text-sm text-destructive">
              {error}
            </Text>
          )}
          {notice && <Text className="font-sans-medium text-sm text-success">{notice}</Text>}
          <Button size="lg" disabled={busy} onPress={submit}>
            {signingUp ? "Załóż konto" : "Zaloguj się"}
          </Button>
          <View className="flex-row gap-3">
            <Button variant="outline" className="flex-1" onPress={() => signInWith("google")}>
              Google
            </Button>
            <Button variant="outline" className="flex-1" onPress={() => signInWith("discord")}>
              Discord
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
