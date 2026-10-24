import { Button, FeaturedHero, GameCard, GameCardSkeleton, GameCardWide, GameTile, GenreTile, QuoteHero, Rail, ReleaseTicker, SegmentedControl, Skeleton, type Game } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "../components/app-shell";
import { FilterPanel } from "../components/filter-panel";
import { GameEmptyState } from "../components/game-empty-state";
import { requireSession } from "../lib/auth";
import { gamesCount } from "../lib/format";
import { DEFAULT_FILTERS, GENRES, TABS, activeFilterCount, type Filters, type TabLabel } from "../lib/filters";
import { useBrowse, useFollows, useFriends, useShelf, useTicker, useToggleFollow, useTopUpcoming } from "../lib/games";
import { useSetList, useUserLists } from "../lib/library";
import { usePolishQuotes } from "../lib/polish-quotes-setting";
import { useUsername } from "../lib/profile";
import { polishQuotes, quotes } from "../quotes";

export const Route = createFileRoute("/")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: Home,
});

const TAB_LABELS = TABS.map((tab) => tab.label);
const SHELVES = [
  { title: "Popularne teraz", tab: "Popularne" },
  { title: "Niedawno wydane", tab: "Nowe premiery" },
  { title: "Najwyżej oceniane", tab: "Najlepiej oceniane" },
] as const;

const monthLabel = (releaseDate: number | null) =>
  releaseDate ? new Date(releaseDate).toLocaleDateString("pl-PL", { month: "long", ...(new Date(releaseDate).getFullYear() !== new Date().getFullYear() && { year: "numeric" }) }) : "TBA";

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
  const shelves = [useShelf(SHELVES[0].tab), useShelf(SHELVES[1].tab), useShelf(SHELVES[2].tab)];
  const browseRef = useRef<HTMLElement>(null);
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);

  const browseGames = useMemo(() => browse.data?.pages.flatMap((page) => page.games) ?? [], [browse.data]);
  const total = browse.data?.pages[0]?.total ?? 0;
  const activeCount = activeFilterCount(filters);
  const known = [...(top.data ?? []), ...(ticker.data ?? []), ...shelves.flatMap((shelf) => shelf.data ?? []), ...browseGames];
  const visibleIds = [...new Set(known.map((g) => g.id))].sort((a, b) => a - b);
  const genreCovers = (label: string) => [...new Map(known.filter((g) => g.cover && g.genres.includes(label)).map((g) => [g.cover!, g.cover!])).values()].slice(0, 3);
  const friends = useFriends(visibleIds).data;

  const showGenre = (label: string) => {
    setFilters({ ...DEFAULT_FILTERS, genres: [label] });
    browseRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const friendGames = known.filter((g, i) => friends?.[g.id] && known.findIndex((k) => k.id === g.id) === i).slice(0, 4);

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
      <QuoteHero user={user} quotes={heroQuotes} compact>
        {top.data ? (
          top.data.length > 0 && (
            <FeaturedHero
              games={top.data}
              following={(id) => follows.data?.has(id) ?? false}
              list={(id) => lists.data?.[id] ?? null}
              onFollow={(id, follow) => toggleFollow.mutate({ gameId: id, follow })}
              onListChange={(id, list) => setList.mutate({ gameId: id, list })}
              onOpen={open}
            />
          )
        ) : (
          <Skeleton aria-hidden className="h-[420px] w-full rounded-xl" />
        )}
        <div className="-mx-4 sm:-mx-8">
          {ticker.data ? (
            ticker.data.length > 0 && <ReleaseTicker games={ticker.data} onOpen={open} />
          ) : (
            <div aria-hidden className="flex gap-1.5 overflow-hidden px-4 py-1.5 sm:px-8">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-9 w-64 shrink-0 rounded-full" />
              ))}
            </div>
          )}
        </div>
      </QuoteHero>

      <div className="relative z-[3] -mt-[72px] flex min-h-[55vh] min-w-0 flex-col gap-14 rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 sm:bg-card/70 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:backdrop-blur-xl sm:px-8">
        <Rail title="Premiery w kalendarzu" subtitle="Co wychodzi w najbliższych miesiącach, od najbliższej daty.">
          {ticker.isPending
            ? skeletons(5, "w-[220px] shrink-0")
            : ticker.data?.map((game, i, all) => {
                const label = monthLabel(game.releaseDate);
                const first = i === 0 || monthLabel(all[i - 1]?.releaseDate ?? null) !== label;
                return (
                  <div key={game.id} className="flex w-[240px] shrink-0 flex-col gap-2.5">
                    <span aria-hidden={!first} className={`text-xs leading-4 font-extrabold tracking-widest text-primary uppercase ${first ? "" : "opacity-0"}`}>{label}</span>
                    {card(game)}
                  </div>
                );
              })}
        </Rail>
        {(top.error || ticker.error) && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać gier: {(top.error ?? ticker.error)?.message}</p>}

        <section aria-label="Zestawienia" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SHELVES.map((shelf, i) => (
            <div key={shelf.title} className="flex min-w-0 flex-col gap-2 rounded-lg border border-white/5 bg-card px-2.5 pt-4 pb-2.5 max-xl:last:md:col-span-2">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-display text-lg leading-6 font-bold">{shelf.title}</h2>
                <button type="button" onClick={() => { setFilters({ ...DEFAULT_FILTERS, tab: shelf.tab }); browseRef.current?.scrollIntoView({ behavior: "smooth" }); }} className="text-[13px] leading-[18px] font-bold text-primary hover:underline">
                  Więcej
                </button>
              </div>
              {shelves[i]?.data
                ? shelves[i].data.map((game, n) => <GameTile key={game.id} game={game} position={n + 1} onOpen={() => open(game.id)} />)
                : Array.from({ length: 5 }, (_, n) => <Skeleton key={n} aria-hidden className="h-[75px] w-full" />)}
            </div>
          ))}
        </section>

        {friendGames.length > 0 && (
          <section className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[22px] leading-7 font-bold tracking-tight sm:text-[28px] sm:leading-[34px]">Twoi znajomi grają i oceniają</h2>
              <p className="text-[13px] leading-[18px] text-muted-foreground">Gry, które obserwują lub ocenili Twoi znajomi.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {friendGames.map((game) => (
                <GameCardWide
                  key={game.id}
                  game={game}
                  friend={friends?.[game.id]}
                  following={follows.data?.has(game.id) ?? false}
                  list={lists.data?.[game.id] ?? null}
                  onFollow={(follow) => toggleFollow.mutate({ gameId: game.id, follow })}
                  onListChange={(list) => setList.mutate({ gameId: game.id, list })}
                  onOpen={() => open(game.id)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[22px] leading-7 font-bold tracking-tight sm:text-[28px] sm:leading-[34px]">Przeglądaj według gatunku</h2>
            <p className="text-[13px] leading-[18px] text-muted-foreground">Szybki skok do listy z gotowym filtrem.</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
            {GENRES.map((genre) => (
              <GenreTile key={genre.label} name={genre.label} covers={genreCovers(genre.label)} onPick={() => showGenre(genre.label)} />
            ))}
          </div>
        </section>

        <section ref={browseRef} className="flex min-w-0 scroll-mt-24 flex-col gap-5">
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
          <div aria-busy={browse.isFetching} className={`grid grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-6 transition-opacity ${browse.isPlaceholderData ? "opacity-60" : ""}`}>
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
