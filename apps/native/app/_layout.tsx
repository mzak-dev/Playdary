import "../global.css";
import { DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Sora_700Bold } from "@expo-google-fonts/sora";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Sora_700Bold, DMSans_400Regular, DMSans_600SemiBold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
    </>
  );
}
