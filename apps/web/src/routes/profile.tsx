import { Avatar, Button, PageHero, SegmentedControl, Switch, TextField } from "@playdary/design-system";
import type { Session } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "../components/app-shell";
import { Panel } from "../components/panel";
import { Overview } from "../components/profile/overview";
import { Ratings } from "../components/profile/ratings";
import { requireSession } from "../lib/auth";
import { useOverlayCards } from "../lib/overlay-cards-setting";
import { usePolishQuotes } from "../lib/polish-quotes-setting";
import { PRIVACY, PRIVACY_LABELS, useProfile, useProfileStats, useUpdateProfile, type Notifications } from "../lib/profile";
import { supabase } from "../lib/supabase";
import { THEMES, setTheme, useTheme } from "../lib/theme";

const SECTIONS = ["Przegląd", "Oceny", "Ustawienia"] as const;

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => ({ session: await requireSession() }),
  validateSearch: (search: Record<string, unknown>): { section?: (typeof SECTIONS)[number] } => ({ section: SECTIONS.find((section) => section === search.section) }),
  component: ProfilePage,
});

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

function ProfilePage() {
  const { session } = Route.useRouteContext();
  const userId = session.user.id;
  const profile = useProfile(userId);
  const stats = useProfileStats(userId);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>(Route.useSearch().section ?? "Przegląd");
  const username = profile.data?.username ?? session.user.email?.split("@")[0] ?? "";
  const [shared, setShared] = useState(false);

  const share = async () => {
    await navigator.clipboard.writeText(`${location.origin}/u/${username}`);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  const statItems = [
    { label: "Obserwowane", value: stats.data?.follows },
    { label: "Ocenione", value: stats.data?.rated },
    { label: "Na listach", value: stats.data?.listed },
    { label: "Znajomi", value: stats.data?.friends },
  ];

  return (
    <AppShell session={session} active="profile">
      <PageHero className="pb-[104px]" contentClassName="flex-row flex-wrap items-center gap-x-8 gap-y-6">
        <Avatar name={username || "?"} size="lg" />
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[clamp(30px,8vw,40px)] leading-[1.1] font-extrabold tracking-tight">{username}</h1>
            <span className="text-sm leading-5 text-muted-foreground">@{username}</span>
          </div>
          <dl className="flex flex-wrap gap-x-10 gap-y-2">
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col-reverse gap-0.5">
                <dt className="text-xs leading-4 font-medium text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-[28px] leading-7 font-bold tabular-nums">{item.value ?? "–"}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <Button onClick={() => setSection("Ustawienia")}>Edytuj profil</Button>
          <Button variant="secondary" onClick={share}>
            Udostępnij
          </Button>
          <span role="status" className="text-sm font-semibold text-success">{shared ? "Skopiowano link" : ""}</span>
        </div>
      </PageHero>

      <div className="relative z-[3] -mt-[72px] min-h-[55vh] rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:bg-card/70 sm:px-8 sm:backdrop-blur-xl">
        <div className="flex flex-col gap-10">
          <div>
            <SegmentedControl label="Sekcje profilu" items={SECTIONS} value={section} onChange={setSection} />
          </div>
          {profile.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać profilu: {profile.error.message}</p>}
          {section === "Przegląd" && <Overview userId={userId} onShowRatings={() => setSection("Oceny")} />}
          {section === "Oceny" && <Ratings userId={userId} />}
          {section === "Ustawienia" && profile.data && <Settings session={session} userId={userId} username={profile.data.username} />}
        </div>
      </div>
    </AppShell>
  );
}

type SettingsProps = { session: Session; userId: string; username: string };

function Settings({ session, userId, username }: SettingsProps) {
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);
  const theme = useTheme();
  const [polishQuotes, setPolishQuotes] = usePolishQuotes();
  const [overlayCards, setOverlayCards] = useOverlayCards();
  const currentEmail = session.user.email ?? "";
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftEmail, setDraftEmail] = useState(currentEmail);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const notifications = profile.data?.notifications;
  const privacy = profile.data?.privacy;

  const saveAccount = async (e: FormEvent) => {
    e.preventDefault();
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
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex max-w-[560px] min-w-[min(420px,100%)] flex-1 flex-col gap-6">
        <Panel title="Konto">
          <form onSubmit={saveAccount} className="flex flex-col gap-5">
            <TextField label="Nazwa użytkownika" autoComplete="off" required minLength={3} maxLength={32} value={draftUsername} onChange={(e) => setDraftUsername(e.target.value)} />
            <TextField label="E-mail" type="email" autoComplete="off" required value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button type="submit" disabled={busy}>Zapisz zmiany</Button>
              {message && (
                <span role={message.error ? "alert" : "status"} className={message.error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>
                  {message.text}
                </span>
              )}
            </div>
          </form>
        </Panel>
        <Panel title="Wygląd">
          <span className="text-[13px] leading-4 font-semibold text-muted-foreground">Motyw</span>
          <div>
            <SegmentedControl label="Motyw" items={THEMES} value={theme} onChange={setTheme} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[15px] leading-[22px] font-semibold">Polskie cytaty</span>
              <span className="text-[13px] leading-[18px] text-muted-foreground">Dodaje do cytatów na stronie głównej kwestie z polskich gier i dubbingów, także z wulgaryzmami. Ustawienie dotyczy tej przeglądarki.</span>
            </div>
            <Switch label="Polskie cytaty" checked={polishQuotes} onChange={setPolishQuotes} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[15px] leading-[22px] font-semibold">Nowy wygląd kafli</span>
              <span className="text-[13px] leading-[18px] text-muted-foreground">Okładka na całym kaflu z nakładką na tytuł i przyciski. Po wyłączeniu wracają klasyczne kafle. Ustawienie dotyczy tej przeglądarki.</span>
            </div>
            <Switch label="Nowy wygląd kafli" checked={overlayCards} onChange={setOverlayCards} />
          </div>
        </Panel>
      </div>

      <div className="flex max-w-[560px] min-w-[min(420px,100%)] flex-1 flex-col gap-6">
        <Panel title="Powiadomienia">
          <div className="flex flex-col">
            {NOTIFICATION_ROWS.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] leading-[22px] font-semibold">{row.label}</span>
                  <span className="text-[13px] leading-[18px] text-muted-foreground">{row.description}</span>
                </div>
                <Switch label={row.label} checked={notifications?.[row.key] ?? false} onChange={(checked) => notifications && update.mutate({ notifications: { ...notifications, [row.key]: checked } })} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Prywatność">
          <span className="text-[13px] leading-4 font-semibold text-muted-foreground">Kto widzi moje listy i oceny</span>
          <div>
            <SegmentedControl
              label="Widoczność list"
              items={PRIVACY_LABELS}
              value={PRIVACY_LABELS.find((label) => PRIVACY[label] === privacy) ?? ""}
              onChange={(label) => update.mutate({ privacy: PRIVACY[label] })}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
