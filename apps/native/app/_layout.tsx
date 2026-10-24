import "../global.css";
import { PlaydaryProvider, createServerEmbedder } from "@playdary/core";
import { fontAssets } from "@playdary/design-system-native/fonts";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isConfigured } from "../lib/env";
import { CACHE_MAX_AGE, persister, queryClient } from "../lib/query";
import { SessionProvider, useSession } from "../lib/session";
import { applyStoredTheme, useOnboarded, useTheme } from "../lib/settings";
import { hydrateStorage } from "../lib/storage";
import { supabase } from "../lib/supabase";

void SplashScreen.preventAutoHideAsync();

const embedder = createServerEmbedder(supabase);

function MissingConfig() {
  return (
    <View className="flex-1 justify-center bg-background p-6">
      <Text className="text-base text-foreground">Brakuje EXPO_PUBLIC_SUPABASE_URL i EXPO_PUBLIC_SUPABASE_ANON_KEY. Skopiuj .env.example do .env w apps/native.</Text>
    </View>
  );
}

function Navigator() {
  const session = useSession();
  const theme = useTheme();
  const onboarded = useOnboarded();

  useEffect(() => {
    if (session !== undefined) void SplashScreen.hideAsync();
  }, [session]);

  if (session === undefined) return null;

  return (
    <>
      <StatusBar style={theme === "Jasny" ? "dark" : "light"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!session && !onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={!session && onboarded}>
          <Stack.Screen name="(auth)/login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [storageReady, setStorageReady] = useState(false);
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    void hydrateStorage().then(() => {
      applyStoredTheme();
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void supabase.auth.startAutoRefresh();
      else void supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  if (!isConfigured) return <MissingConfig />;
  if (!storageReady || !fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: CACHE_MAX_AGE, buster: "v1" }}>
        <PlaydaryProvider supabase={supabase} embedder={embedder}>
          <SessionProvider>
            <Navigator />
          </SessionProvider>
        </PlaydaryProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
