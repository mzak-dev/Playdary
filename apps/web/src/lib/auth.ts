import { redirect } from "@tanstack/react-router";
import { supabase } from "./supabase";

export async function requireSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw redirect({ to: "/login" });
  return data.session;
}

export async function redirectIfSignedIn() {
  const { data } = await supabase.auth.getSession();
  if (data.session) throw redirect({ to: "/" });
}
