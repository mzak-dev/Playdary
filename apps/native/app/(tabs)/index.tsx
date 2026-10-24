import {
  DEFAULT_FILTERS,
  TABS,
  activeFilterCount,
  gamesCount,
  polishQuotes,
  quotes,
  useBrowse,
  useFollows,
  useFriends,
  useSetList,
  useTicker,
  useToggleFollow,
  useTopUpcoming,
  useUserLists,
  useUsername,
  SORTS,
  type Filters,
  type Game,
  type TabLabel,
} from "@playdary/core";
import { Button, EmptyState, GameCard, GameCardSkeleton, QuoteHero, Rail, ReleaseTicker, SegmentedControl, Skeleton, useTokenColor } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { FilterSheet } from "../../components/filter-sheet";
import { useRequiredSession } from "../../lib/session";
import { usePolishQuotes } from "../../lib/settings";

const TAB_LABELS = TABS.map((tab) => tab.label);
const skeletons = (count: number, className?: string) => Array.from({ length: count }, (_, i) => <GameCardSkeleton key={i} className={className} />);

export default function Home() {
  const session = useRequiredSession();
  const userId = session.user.id;
  const router = useRouter();
  const foreground = useTokenColor("foreground");
  const user = useUsername(session);
  const [polishEnabled] = usePolishQuotes();
  const heroQuotes = useMemo(() => (polishEnabled ? [...quotes, ...polishQuotes] : quotes), [polishEnabled]);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, tab: filters.tab });

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([top.refetch(), ticker.refetch(), browse.refetch()]);
    setRefreshing(false);
  };

  const open = (id: number) => router.push(`/games/${id}`);

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

  const header = (
    <View className="gap-8 pb-5">
      <QuoteHero user={user} quotes={heroQuotes}>
        {ticker.data ? (
          ticker.data.length > 0 && <ReleaseTicker games={ticker.data} onOpen={open} />
        ) : (
          <View className="flex-row gap-1.5 overflow-hidden py-1.5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-64 shrink-0 rounded-full" />
            ))}
          </View>
        )}
      </QuoteHero>

      <Rail title="Najbardziej wyczekiwane" subtitle="Top 10 nadchodzących gier według liczby obserwujących w IGDB, z odliczaniem do premiery.">
        {top.isPending ? skeletons(3, "w-[300px] shrink-0") : top.data?.map((game, i) => card(game, i + 1, "w-[300px] shrink-0"))}
      </Rail>
      {top.error && <Text accessibilityRole="alert" className="px-4 font-sans-medium text-sm text-destructive">Nie udało się wczytać gier: {top.error.message}</Text>}

      <View className="gap-4 px-4">
        <Text accessibilityRole="header" className="font-display text-2xl leading-[30px] tracking-tight text-foreground">
          Przeglądaj gry
        </Text>
        <SegmentedControl label="Sekcje" items={TAB_LABELS} value={filters.tab} onChange={(tab: TabLabel) => setFilters({ ...filters, tab })} />
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-2">
          <Button variant="outline" size="sm" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(true)}>
            <SlidersHorizontal color={foreground} size={16} />
            {`Filtry${activeCount > 0 ? ` (${activeCount})` : ""}`}
          </Button>
          {browse.data ? <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{gamesCount(total)}</Text> : <Skeleton className="h-4 w-20" />}
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="ml-auto" onPress={resetFilters}>
              Wyczyść filtry
            </Button>
          )}
        </View>
        {browse.error && <Text accessibilityRole="alert" className="font-sans-medium text-sm text-destructive">Nie udało się wczytać gier: {browse.error.message}</Text>}
        {browse.data && browseGames.length === 0 && (
          <EmptyState
            label="Brak wyników"
            title="Żadna gra nie pasuje do filtrów"
            text="Spróbuj poluzować kryteria albo wyczyść filtry, żeby wrócić do pełnej listy."
            action={<Button onPress={resetFilters}>Wyczyść filtry</Button>}
          />
        )}
        {browse.isPending && <View className="gap-6">{skeletons(2)}</View>}
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={browseGames}
        keyExtractor={(game) => String(game.id)}
        renderItem={({ item }) => <View className="px-4 pb-6">{card(item)}</View>}
        ListHeaderComponent={header}
        ListFooterComponent={
          <View className="items-center gap-6 px-4 pb-28">
            {browse.isFetchingNextPage && skeletons(1, "w-full")}
            {browse.hasNextPage && !browse.isFetchingNextPage && (
              <Button variant="secondary" onPress={() => browse.fetchNextPage()}>
                Pokaż więcej
              </Button>
            )}
          </View>
        }
        onEndReached={() => browse.hasNextPage && !browse.isFetchingNextPage && browse.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        className="flex-1 bg-background"
      />
      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        sorts={SORTS}
        summary={browse.data ? gamesCount(total) : undefined}
      />
    </>
  );
}
