import { Avatar, Button, GameRow, PageHero, Rating, SegmentedControl, Skeleton, Switch, TextField } from "@playdary/design-system";
import type { Session } from "@supabase/supabase-js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { AppShell } from "../components/app-shell";
import { requireSession } from "../lib/auth";
import { useMyFriends, useProfile, useProfileStats, useRatedGames, useUpdateProfile, type Notifications, type Privacy } from "../lib/profile";
import { supabase } from "../lib/supabase";
import { THEMES, setTheme, useTheme } from "../lib/theme";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: ProfilePage,
});

const SECTIONS = ["Przegląd", "Ustawienia"] as const;

const PRIVACY: Record<string, Privacy> = { Wszyscy: "everyone", Znajomi: "friends", "Tylko ja": "private" };
const PRIVACY_LABELS = Object.keys(PRIVACY);

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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-lg bg-secondary p-6">
      <h2 className="font-display text-xl leading-[26px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

const SectionHeading = ({ children }: { children: ReactNode }) => <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">{children}</h2>;

function ProfilePage() {
  const { session } = Route.useRouteContext();
  const userId = session.user.id;
  const profile = useProfile(userId);
  const stats = useProfileStats(userId);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Przegląd");
  const username = profile.data?.username ?? session.user.email?.split("@")[0] ?? "";

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
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(30px,8vw,40px)] leading-[1.1] font-extrabold tracking-tight">{username}</h1>
          <dl className="flex flex-wrap gap-x-10 gap-y-2">
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col-reverse gap-0.5">
                <dt className="text-xs leading-4 font-medium text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-[28px] leading-7 font-bold tabular-nums">{item.value ?? "–"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      <div className="relative z-[3] -mt-[72px] min-h-[55vh] rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:bg-card/70 sm:px-8 sm:backdrop-blur-xl">
        <div className="flex flex-col gap-10">
          <div>
            <SegmentedControl label="Sekcje profilu" items={SECTIONS} value={section} onChange={setSection} />
          </div>
          {profile.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać profilu: {profile.error.message}</p>}
          {section === "Przegląd" && <Overview userId={userId} />}
          {section === "Ustawienia" && profile.data && <Settings session={session} userId={userId} username={profile.data.username} />}
        </div>
      </div>
    </AppShell>
  );
}

function Overview({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const rated = useRatedGames(userId);
  const friends = useMyFriends(userId);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <SectionHeading>Twoje oceny</SectionHeading>
        {rated.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać ocen: {rated.error.message}</p>}
        {rated.isPending && (
          <div aria-hidden className="flex flex-col gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-[60px] w-[88px] shrink-0" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}
        {rated.data?.length === 0 && <p className="text-muted-foreground">Nie oceniono jeszcze żadnej gry. Oceń grę na jej stronie.</p>}
        <div className="flex flex-col gap-1">
          {rated.data?.map(({ game, score }) => (
            <div key={game.id} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="min-w-0 flex-[1_1_min(560px,100%)]">
                <GameRow game={game} onOpen={() => navigate({ to: "/games/$gameId", params: { gameId: String(game.id) } })} />
              </div>
              <Rating value={score} readOnly />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Znajomi</SectionHeading>
        {friends.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać znajomych: {friends.error.message}</p>}
        {friends.data?.length === 0 && <p className="text-muted-foreground">Nie masz jeszcze znajomych.</p>}
        <ul className="flex flex-wrap gap-3">
          {friends.data?.map((friend) => (
            <li key={friend.id} className="flex items-center gap-2 rounded-full bg-secondary py-1.5 pr-4 pl-1.5 text-sm font-semibold">
              <Avatar name={friend.username} size="sm" />
              {friend.username}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type SettingsProps = { session: Session; userId: string; username: string };

function Settings({ session, userId, username }: SettingsProps) {
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);
  const theme = useTheme();
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
