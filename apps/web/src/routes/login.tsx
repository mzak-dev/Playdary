import { Button, SegmentedControl, TextField } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { redirectIfSignedIn } from "../lib/auth";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/login")({ beforeLoad: redirectIfSignedIn, component: Login });

const MODES = ["Zaloguj się", "Załóż konto"] as const;
type Mode = (typeof MODES)[number];

const errorText = (message: string) => (message.toLowerCase().includes("invalid login") ? "Nieprawidłowy e-mail lub hasło." : message);

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("Zaloguj się");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signingUp = mode === "Załóż konto";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const result = signingUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { username }, emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (result.error) return setError(errorText(result.error.message));
    if (result.data.session) return navigate({ to: "/" });
    setNotice("Sprawdź skrzynkę i potwierdź adres e-mail, a potem się zaloguj.");
  };

  const signInWith = async (provider: "google" | "discord") => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    });
    if (error) setError(error.message);
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-lg bg-card p-8">
        <h1 className="font-display text-4xl leading-[44px] font-extrabold tracking-tight">Playdary</h1>
        <SegmentedControl label="Tryb" items={MODES} value={mode} onChange={setMode} />
        <TextField label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {signingUp && (
          <TextField label="Nazwa użytkownika" autoComplete="username" required minLength={3} maxLength={32} value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <TextField
          label="Hasło"
          type="password"
          autoComplete={signingUp ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        {notice && <p role="status" className="text-sm font-medium text-success">{notice}</p>}
        <Button type="submit" size="lg" disabled={busy}>
          {signingUp ? "Załóż konto" : "Zaloguj się"}
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => signInWith("google")}>Google</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => signInWith("discord")}>Discord</Button>
        </div>
      </form>
    </main>
  );
}
