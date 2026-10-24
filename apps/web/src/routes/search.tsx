import { Button, Chip, GameCard, GameCardSkeleton, PageHero, SegmentedControl, SelectField, Switch } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "../components/app-shell";
import { GameEmptyState } from "../components/game-empty-state";
import { requireSession } from "../lib/auth";
import { GENRES, PERIODS, PLATFORMS, SCORES } from "../lib/filters";
import { gamesCount } from "../lib/format";
import { useFollows, useFriends, useSearchResults, useToggleFollow } from "../lib/games";
import { useSetList, useUserLists } from "../lib/library";
import { DEFAULT_SEARCH_FILTERS, SEARCH_SORTS, facetCounts, filterGames, searchFilterCount, type SearchFilters } from "../lib/search-filters";

export const Route = createFileRoute("/search")({
  beforeLoad: async () => ({ session: await requireSession() }),
  validateSearch: (search: Record<string, unknown>): { q: string } => ({ q: typeof search.q === "string" ? search.q : "" }),
  component: SearchPage,
});

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function SearchPage() {
  const { session } = Route.useRouteContext();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const userId = session.user.id;
  const query = q.trim();
  const results = useSearchResults(query);
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);
  const [draft, setDraft] = useState(q);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const found = results.data;
  const visible = useMemo(() => filterGames(found ?? [], filters, lists.data ?? {}), [found, filters, lists.data]);
  const facets = useMemo(() => facetCounts(found ?? []), [found]);
  const friends = useFriends(useMemo(() => visible.map((g) => g.id).sort((a, b) => a - b), [visible])).data;
  const activeCount = searchFilterCount(filters);
  const set = (patch: Partial<SearchFilters>) => setFilters({ ...filters, ...patch });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) navigate({ search: { q: draft.trim() } });
  };

  const pills = [
    ...filters.platforms.map((label) => ({ label, remove: () => set({ platforms: toggle(filters.platforms, label) }) })),
    ...filters.genres.map((label) => ({ label, remove: () => set({ genres: toggle(filters.genres, label) }) })),
    ...(filters.period !== "any" ? [{ label: PERIODS.find((p) => p.value === filters.period)!.label, remove: () => set({ period: "any" }) }] : []),
    ...(filters.minScore ? [{ label: `Ocena ${SCORES.find((s) => s.value === filters.minScore)?.label}`, remove: () => set({ minScore: 0 }) }] : []),
    ...(filters.hideListed ? [{ label: "Bez moich list", remove: () => set({ hideListed: false }) }] : []),
  ];

  const filterPanel = (
    <aside
      aria-label="Filtry wyszukiwania"
      className={`flex flex-col gap-6 bg-background p-5 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[62] max-lg:max-h-[85vh] max-lg:overflow-y-auto max-lg:rounded-t-3xl max-lg:shadow-[0_-24px_60px_rgba(0,0,0,0.55)] max-lg:transition-transform max-lg:duration-[450ms] lg:sticky lg:top-24 lg:rounded-xl lg:bg-card lg:ring-1 lg:ring-white/5 ${sheetOpen ? "" : "max-lg:invisible max-lg:translate-y-full"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl leading-[26px] font-bold">Filtry</h2>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ ...DEFAULT_SEARCH_FILTERS, sort: filters.sort })}>
              Wyczyść
            </Button>
          )}
          <button type="button" aria-label="Zamknij filtry" onClick={() => setSheetOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-accent lg:hidden">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>
      </div>
      <Group label="Platforma">
        {facets.platforms.map(({ label, count }) => (
          <Chip key={label} pressed={filters.platforms.includes(label)} className={count === 0 ? "opacity-40" : ""} onClick={() => set({ platforms: toggle(filters.platforms, label) })}>
            {label}
            <span className="ml-1.5 text-[11px] opacity-60">{count}</span>
          </Chip>
        ))}
      </Group>
      <Group label="Gatunek">
        {facets.genres.map(({ label, count }) => (
          <Chip key={label} pressed={filters.genres.includes(label)} className={count === 0 ? "opacity-40" : ""} onClick={() => set({ genres: toggle(filters.genres, label) })}>
            {label}
            <span className="ml-1.5 text-[11px] opacity-60">{count}</span>
          </Chip>
        ))}
      </Group>
      <Group label="Premiera">
        <SegmentedControl label="Okres premiery" items={PERIODS.map((p) => p.label)} value={PERIODS.find((p) => p.value === filters.period)!.label} onChange={(label) => set({ period: PERIODS.find((p) => p.label === label)?.value ?? "any" })} />
      </Group>
      <Group label="Minimalna ocena">
        <SegmentedControl label="Minimalna ocena" items={SCORES.map((s) => s.label)} value={SCORES.find((s) => s.value === filters.minScore)!.label} onChange={(label) => set({ minScore: SCORES.find((s) => s.label === label)?.value ?? 0 })} />
      </Group>
      <span className="inline-flex items-center gap-2.5 text-sm leading-5 font-medium">
        <Switch label="Ukryj gry z moich list" checked={filters.hideListed} onChange={(hideListed) => set({ hideListed })} />
        Ukryj gry z moich list
      </span>
      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-background from-75% to-transparent px-5 pt-3 pb-4 lg:hidden">
        <Button className="w-full justify-center" onClick={() => setSheetOpen(false)}>
          Pokaż {gamesCount(visible.length)}
        </Button>
      </div>
    </aside>
  );

  return (
    <AppShell session={session}>
      <PageHero className="pb-[104px]">
        <span className="text-xs leading-4 font-bold tracking-wider text-primary uppercase">Wyszukiwanie</span>
        <h1 className="font-display text-[clamp(30px,7vw,52px)] leading-[1.05] font-extrabold tracking-tight [overflow-wrap:anywhere]">{query ? `Wyniki dla „${query}”` : "Szukaj gier"}</h1>
        <form onSubmit={submit} role="search" className="flex h-[52px] max-w-[680px] items-center gap-3 rounded-full bg-secondary/80 pr-1.5 pl-5 ring-1 ring-white/10 backdrop-blur-lg focus-within:ring-2 focus-within:ring-primary sm:h-[58px]">
          <input
            type="search"
            value={draft}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Szukaj gier, gatunków, platform…"
            aria-label="Szukaj gier"
            onChange={(e) => setDraft(e.target.value)}
            className="h-full min-w-0 flex-1 appearance-none bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          <Button type="submit" className="max-sm:hidden">
            Szukaj
          </Button>
        </form>
      </PageHero>

      <div className="relative z-[3] -mt-[72px] min-h-[55vh] rounded-t-xl border border-b-0 border-white/5 bg-card/90 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] sm:bg-card/70 sm:px-8 sm:backdrop-blur-xl">
        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <div aria-hidden onClick={() => setSheetOpen(false)} className={`fixed inset-0 z-[61] bg-black/55 transition-opacity duration-300 lg:hidden ${sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
          {filterPanel}
          <section aria-live="polite" className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
              <Button variant="outline" size="sm" aria-expanded={sheetOpen} className="lg:hidden" onClick={() => setSheetOpen(true)}>
                <SlidersHorizontal aria-hidden className="size-4" />
                Filtry{activeCount > 0 && ` (${activeCount})`}
              </Button>
              <span className="text-[15px] leading-[22px] text-muted-foreground">
                <b className="font-display text-lg font-extrabold text-foreground">{found ? visible.length.toLocaleString("pl-PL") : "–"}</b> {found ? gamesCount(visible.length).split(" ")[1] : "gier"}
              </span>
              <label className="ml-auto inline-flex items-center gap-2.5 text-[13px] leading-[18px] font-semibold text-muted-foreground">
                <span className="max-sm:hidden">Sortuj</span>
                <SelectField aria-label="Sortuj wyniki" value={filters.sort} onChange={(e) => set({ sort: e.target.value as SearchFilters["sort"] })}>
                  {SEARCH_SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>
              </label>
            </div>
            {pills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <button key={pill.label} type="button" aria-label={`Usuń filtr ${pill.label}`} onClick={pill.remove} className="inline-flex h-8 items-center gap-2 rounded-full border border-primary/45 bg-primary/10 pr-2.5 pl-3.5 text-[13px] font-semibold hover:bg-primary/20">
                    {pill.label}
                    <X aria-hidden className="size-3.5 opacity-70" />
                  </button>
                ))}
              </div>
            )}
            {results.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wyszukać gier: {results.error.message}</p>}
            {query.length < 2 && <GameEmptyState label="Wyszukiwanie" title="Wpisz nazwę gry" text="Wpisz co najmniej dwa znaki i zatwierdź Enterem, żeby zobaczyć wszystkie wyniki." />}
            {found && visible.length === 0 && (
              <GameEmptyState
                label="Brak wyników"
                title={found.length === 0 ? `Nic nie znaleziono dla „${query}”` : "Żadna gra nie pasuje do filtrów"}
                text={found.length === 0 ? "Sprawdź pisownię albo opisz grę innymi słowami, np. gatunkiem lub klimatem." : "Poluzuj kryteria albo wyczyść filtry, żeby wrócić do pełnej listy wyników."}
                action={found.length > 0 ? <Button onClick={() => setFilters(DEFAULT_SEARCH_FILTERS)}>Wyczyść filtry</Button> : undefined}
              />
            )}
            <div aria-busy={results.isFetching} className={`grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6 transition-opacity ${results.isPlaceholderData ? "opacity-60" : ""}`}>
              {query.length > 1 && results.isPending && Array.from({ length: 6 }, (_, i) => <GameCardSkeleton key={i} />)}
              {visible.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  friend={friends?.[game.id]}
                  following={follows.data?.has(game.id) ?? false}
                  list={lists.data?.[game.id] ?? null}
                  onFollow={(follow) => toggleFollow.mutate({ gameId: game.id, follow })}
                  onListChange={(list) => setList.mutate({ gameId: game.id, list })}
                  onOpen={() => navigate({ to: "/games/$gameId", params: { gameId: String(game.id) } })}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs leading-4 font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
