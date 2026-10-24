import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export const errorText = (message: string) => (message.toLowerCase().includes("invalid login") ? "Nieprawidłowy e-mail lub hasło." : message);

const redirectUrl = () => Linking.createURL("login");

export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });

export const signUp = (email: string, password: string, username: string) =>
  supabase.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: redirectUrl() } });

export const signOut = () => supabase.auth.signOut();

export async function signInWithProvider(provider: "google" | "discord") {
  const redirectTo = redirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
  if (error || !data.url) return { error: error?.message ?? "Brak adresu logowania" };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return { error: null };

  const params = new URLSearchParams(result.url.split("#")[1] ?? "");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return { error: "Logowanie nie zwróciło sesji" };

  const session = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return { error: session.error?.message ?? null };
}
