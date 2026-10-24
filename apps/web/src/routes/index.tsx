import { Button, GameCard, GameCardSkeleton, QuoteHero, Rail, ReleaseTicker, SegmentedControl, Skeleton, type Game } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { FilterPanel } from "../components/filter-panel";
import { GameEmptyState } from "../components/game-empty-state";
import { requireSession } from "../lib/auth";
import { gamesCount } from "../lib/format";
import { DEFAULT_FILTERS, TABS, activeFilterCount, type Filters, type TabLabel } from "../lib/filters";
import { useBrowse, useFollows, useFriends, useTicker, useToggleFollow, useTopUpcoming } from "../lib/games";
import { useSetList, useUserLists } from "../lib/library";
import { usePolishQuotes } from "../lib/polish-quotes-setting";
import { useUsername } from "../lib/profile";
import { polishQuotes, quotes } from "../quotes";

export const Route = createFileRoute("/")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: Home,
});

const TAB_LABELS = TABS.map((tab) => tab.label);
const skeletons = (count: number, className?: string) => Array.from({ length: count }, (_, i) => <GameCardSkeleton key={i} className={className} />);

function Home() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const userId = session.user.id;
  const user = useUsername(session);
  const [polishEnabled] = usePolishQuotes();
  const heroQuotes = useMemo(() => (polishEnabled ? [...quotes, ...polishQuotes] : quotes), [polishEnabled]);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const top = useTopUpcoming();
  const ticker = useTicker();
  const browse = useBrowse(filters);
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);

  const browseGames = useMemo(() => browse.data?.pages.flatMap((page) => page.games) ?? [], [browse.data]);
  const total = browse.data?.pages[0]?.total ?? 0;
  const activeCount = activeFilterCount(filters);
  const visibleIds = useMemo(() => [...new Set([...(top.data ?? []), ...browseGames].map((g) => g.id))].sort((a, b) => a - b), [top.data, browseGames]);
  const friends = useFriends(visibleIds).data;

  const open = (id: number) => navigate({ to: "/games/$gameId", params: { gameId: String(id) } });

  const card = (game: Game, rank?: number, className?: string) => (
    <GameCard
      key={game.id}
      game={game}
      rank={rank}
      friend={friends?.[game.id]}
      following={follows.data?.has(game.id) ?? false}
      list={lists.data?.[game.id] ?? null}
      onFollow={(follow) => toggleFollow.mutate({ gameId: game.id, follow })}
      onListChange={(list) => setList.mutate({ gameId: game.id, list })}
      onOpen={() => open(game.id)}
      className={className}
    />
  );

  return (
    <AppShell session={session}>
      <QuoteHero user={user} quotes={heroQuotes}>
        {ticker.data ? (
          ticker.data.length > 0 && <ReleaseTicker games={ticker.data} onOpen={open} />
        ) : (
          <div aria-hidden className="flex gap-1.5 overflow-hidden px-4 py-1.5 sm:px-8">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-64 shrink-0 rounded-full" />
            ))}
          </div>
        )}
      </QuoteHero>

      <div className="relative z-[3] -mt-[72px] flex min-h-[55vh] flex-col gap-14 rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 sm:bg-card/70 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:backdrop-blur-xl sm:px-8">
        <Rail title="Najbardziej wyczekiwane" subtitle="Top 10 nadchodzących gier według liczby obserwujących w IGDB, z odliczaniem do premiery.">
          {top.isPending ? skeletons(5, "w-[300px] shrink-0") : top.data?.map((game, i) => card(game, i + 1, "w-[300px] shrink-0"))}
        </Rail>
        {top.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać gier: {top.error.message}</p>}

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">Przeglądaj gry</h2>
            <SegmentedControl label="Sekcje" items={TAB_LABELS} value={filters.tab} onChange={(tab: TabLabel) => setFilters({ ...filters, tab })} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button variant="outline" size="sm" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal aria-hidden className="size-4" />
              Filtry{activeCount > 0 && ` (${activeCount})`}
            </Button>
            <span aria-live="polite" className="text-[13px] leading-[18px] text-muted-foreground">
              {browse.data ? gamesCount(total) : <Skeleton className="inline-block h-4 w-20 align-middle" />}
            </span>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setFilters({ ...DEFAULT_FILTERS, tab: filters.tab })}>
                Wyczyść filtry
              </Button>
            )}
          </div>
          {filtersOpen && <FilterPanel filters={filters} onChange={setFilters} />}

          {browse.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać gier: {browse.error.message}</p>}
          {browse.data && browseGames.length === 0 && (
            <GameEmptyState
              label="Brak wyników"
              title="Żadna gra nie pasuje do filtrów"
              text="Spróbuj poluzować kryteria albo wyczyść filtry, żeby wrócić do pełnej listy."
              action={<Button onClick={() => setFilters({ ...DEFAULT_FILTERS, tab: filters.tab })}>Wyczyść filtry</Button>}
            />
          )}
          <div aria-busy={browse.isFetching} className={`grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6 transition-opacity ${browse.isPlaceholderData ? "opacity-60" : ""}`}>
            {browse.isPending ? skeletons(8) : browseGames.map((game) => card(game))}
            {browse.isFetchingNextPage && skeletons(4)}
          </div>
          {browse.hasNextPage && (
            <Button variant="secondary" className="self-center" disabled={browse.isFetchingNextPage} onClick={() => browse.fetchNextPage()}>
              Pokaż więcej
            </Button>
          )}
        </section>
      </div>
    </AppShell>
  );
}
