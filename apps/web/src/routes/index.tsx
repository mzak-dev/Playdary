import { GameCard, NavBar, QuoteHero, Rail, ReleaseTicker, SegmentedControl, type Game } from "@playdary/design-system";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { requireSession } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { sampleFriends, sampleGames, sampleQuotes } from "../sample-data";

export const Route = createFileRoute("/")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: Home,
});

const NAV_LINKS = [
  { id: "home", label: "Strona główna", short: "Główna" },
  { id: "lists", label: "Moje listy", short: "Listy" },
];

const TABS = ["Popularne", "Nadchodzące premiery", "Najlepiej oceniane"] as const;
type Tab = (typeof TABS)[number];

const byTab: Record<Tab, (games: Game[]) => Game[]> = {
  Popularne: (games) => [...games].sort((a, b) => b.follows - a.follows),
  "Nadchodzące premiery": (games) =>
    games.filter((g) => g.releaseDate && g.releaseDate > Date.now()).sort((a, b) => (a.releaseDate ?? 0) - (b.releaseDate ?? 0)),
  "Najlepiej oceniane": (games) => games.filter((g) => g.score !== null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
};

function Home() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["profile", session.user.id],
    queryFn: async () => (await supabase.from("profiles").select("username").eq("id", session.user.id).single()).data,
  });
  const user = profile?.username ?? session.user.email?.split("@")[0] ?? "";

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  const [tab, setTab] = useState<Tab>("Popularne");
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  const upcoming = useMemo(() => byTab["Nadchodzące premiery"](sampleGames), []);
  const topUpcoming = useMemo(() => [...upcoming].sort((a, b) => b.follows - a.follows).slice(0, 10), [upcoming]);
  const browse = useMemo(() => byTab[tab](sampleGames), [tab]);
  const suggestions = useMemo(
    () => (query.trim() ? sampleGames.filter((g) => g.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5) : []),
    [query],
  );

  const toggleFollow = (id: number, on: boolean) =>
    setFollowed((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="mx-auto max-w-[1344px]">
      <NavBar user={user} links={NAV_LINKS} active="home" onNavigate={() => {}} suggestions={suggestions} onSearch={setQuery} onPick={() => {}} onSignOut={signOut} />

      <QuoteHero user={user} quotes={sampleQuotes}>
        <ReleaseTicker games={upcoming} />
      </QuoteHero>

      <div className="relative z-[3] -mt-[72px] flex min-h-[55vh] flex-col gap-14 rounded-t-xl border border-b-0 border-white/5 bg-card/70 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-8">
        <Rail title="Najbardziej wyczekiwane" subtitle="Top 10 według liczby obserwujących w IGDB, z odliczaniem do premiery.">
          {topUpcoming.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              rank={i + 1}
              friend={sampleFriends[game.id]}
              following={followed.has(game.id)}
              onFollow={(on) => toggleFollow(game.id, on)}
              className="w-[300px] shrink-0"
            />
          ))}
        </Rail>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">Przeglądaj gry</h2>
            <SegmentedControl label="Sekcje" items={TABS} value={tab} onChange={setTab} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6">
            {browse.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                friend={sampleFriends[game.id]}
                following={followed.has(game.id)}
                onFollow={(on) => toggleFollow(game.id, on)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
