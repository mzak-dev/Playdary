import { GameCard, NavBar, QuoteHero, Rail, ReleaseTicker, SegmentedControl, type Game } from "@playdary/design-system";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { requireSession } from "../lib/auth";
import { BROWSE_TABS, useBrowse, useFollows, useFriends, useSearch, useTicker, useToggleFollow, useTopUpcoming, type BrowseTab } from "../lib/games";
import { supabase } from "../lib/supabase";
import { useDebounced } from "../lib/use-debounced";
import { quotes } from "../quotes";

export const Route = createFileRoute("/")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: Home,
});

const NAV_LINKS = [
  { id: "home", label: "Strona główna", short: "Główna" },
  { id: "lists", label: "Moje listy", short: "Listy" },
];

const Status = ({ pending, error, empty }: { pending: boolean; error: Error | null; empty: boolean }) => {
  if (error) return <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać gier: {error.message}</p>;
  if (pending) return <p className="text-sm text-muted-foreground">Ładowanie…</p>;
  if (empty) return <p className="text-sm text-muted-foreground">Brak gier do pokazania.</p>;
  return null;
};

function Home() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const userId = session.user.id;
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => (await supabase.from("profiles").select("username").eq("id", userId).single()).data,
  });
  const user = profile?.username ?? session.user.email?.split("@")[0] ?? "";

  const [tab, setTab] = useState<BrowseTab>("Popularne");
  const [query, setQuery] = useState("");
  const top = useTopUpcoming();
  const ticker = useTicker();
  const browse = useBrowse(tab);
  const search = useSearch(useDebounced(query.trim()));
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);

  const visibleIds = useMemo(() => [...new Set([...(top.data ?? []), ...(browse.data ?? [])].map((g) => g.id))].sort((a, b) => a - b), [top.data, browse.data]);
  const friends = useFriends(visibleIds).data;

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  const card = (game: Game, rank?: number, className?: string) => (
    <GameCard
      key={game.id}
      game={game}
      rank={rank}
      friend={friends?.[game.id]}
      following={follows.data?.has(game.id) ?? false}
      onFollow={(follow) => toggleFollow.mutate({ gameId: game.id, follow })}
      className={className}
    />
  );

  return (
    <div className="mx-auto max-w-[1344px]">
      <NavBar
        user={user}
        links={NAV_LINKS}
        active="home"
        onNavigate={() => {}}
        suggestions={query.trim().length > 1 ? (search.data ?? []) : []}
        onSearch={setQuery}
        onPick={() => {}}
        onSignOut={signOut}
      />

      <QuoteHero user={user} quotes={quotes}>
        {ticker.data && ticker.data.length > 0 && <ReleaseTicker games={ticker.data} />}
      </QuoteHero>

      <div className="relative z-[3] -mt-[72px] flex min-h-[55vh] flex-col gap-14 rounded-t-xl border border-b-0 border-white/5 bg-card/70 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-8">
        <Rail title="Najbardziej wyczekiwane" subtitle="Top 10 nadchodzących gier według liczby obserwujących w IGDB, z odliczaniem do premiery.">
          {top.data?.map((game, i) => card(game, i + 1, "w-[300px] shrink-0"))}
        </Rail>
        <Status pending={top.isPending} error={top.error} empty={top.data?.length === 0} />

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">Przeglądaj gry</h2>
            <SegmentedControl label="Sekcje" items={BROWSE_TABS} value={tab} onChange={setTab} />
          </div>
          <Status pending={browse.isPending} error={browse.error} empty={browse.data?.length === 0} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6">{browse.data?.map((game) => card(game))}</div>
        </section>
      </div>
    </div>
  );
}
