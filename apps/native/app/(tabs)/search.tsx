import {
  DEFAULT_SEARCH_FILTERS,
  PERIODS,
  SCORES,
  SEARCH_SORTS,
  facetCounts,
  filterGames,
  gamesCount,
  searchFilterCount,
  useFollows,
  useFriends,
  useSearchResults,
  useSetList,
  useToggleFollow,
  useUserLists,
  type SearchFilters,
} from "@playdary/core";
import { Button, EmptyState, GameCard, GameCardSkeleton, PageHero, useTokenColor } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { SlidersHorizontal, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterSheet } from "../../components/filter-sheet";
import { ErrorText } from "../../components/panel";
import { SearchField } from "../../components/search-field";
import { useRequiredSession } from "../../lib/session";

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export default function Search() {
  const session = useRequiredSession();
  const userId = session.user.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useTokenColor("foreground");
  const primary = useTokenColor("primary");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useSearchResults(query);
  const follows = useFollows(userId);
  const toggleFollow = useToggleFollow(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);

  const found = results.data;
  const visible = useMemo(() => filterGames(found ?? [], filters, lists.data ?? {}), [found, filters, lists.data]);
  const facets = useMemo(() => facetCounts(found ?? []), [found]);
  const friends = useFriends(useMemo(() => visible.map((g) => g.id).sort((a, b) => a - b), [visible])).data;
  const activeCount = searchFilterCount(filters);
  const set = (patch: Partial<SearchFilters>) => setFilters({ ...filters, ...patch });
  const reset = () => setFilters({ ...DEFAULT_SEARCH_FILTERS, sort: filters.sort });
  const submit = () => setQuery(draft.trim());

  const pills = [
    ...filters.platforms.map((label) => ({ label, remove: () => set({ platforms: toggle(filters.platforms, label) }) })),
    ...filters.genres.map((label) => ({ label, remove: () => set({ genres: toggle(filters.genres, label) }) })),
    ...(filters.period !== "any" ? [{ label: PERIODS.find((p) => p.value === filters.period)!.label, remove: () => set({ period: "any" }) }] : []),
    ...(filters.minScore ? [{ label: `Ocena ${SCORES.find((s) => s.value === filters.minScore)?.label}`, remove: () => set({ minScore: 0 }) }] : []),
    ...(filters.hideListed ? [{ label: "Bez moich list", remove: () => set({ hideListed: false }) }] : []),
  ];

  const header = (
    <View className="gap-6 pb-4">
      <View style={{ paddingTop: insets.top }}>
        <PageHero>
          <Text className="font-sans-bold text-xs leading-4 tracking-wider text-primary uppercase">Wyszukiwanie</Text>
          <Text accessibilityRole="header" className="font-display-extrabold text-[36px] leading-[40px] tracking-tight text-foreground">
            {query ? `Wyniki dla „${query}”` : "Szukaj gier"}
          </Text>
          <SearchField label="Szukaj gier" value={draft} onChangeText={setDraft} onSubmit={submit} placeholder="Szukaj gier, gatunków, platform…" />
        </PageHero>
      </View>

      <View className="gap-4 px-4">
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2.5">
          <Button variant="outline" size="sm" accessibilityState={{ expanded: sheetOpen }} onPress={() => setSheetOpen(true)}>
            <SlidersHorizontal color={foreground} size={16} />
            {`Filtry${activeCount > 0 ? ` (${activeCount})` : ""}`}
          </Button>
          <Text className="font-sans text-[15px] leading-[22px] text-muted-foreground">
            <Text className="font-display-extrabold text-lg text-foreground">{found ? visible.length.toLocaleString("pl-PL") : "–"}</Text> {found ? gamesCount(visible.length).split(" ")[1] : "gier"}
          </Text>
        </View>
        {pills.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {pills.map((pill) => (
              <Pressable key={pill.label} accessibilityRole="button" accessibilityLabel={`Usuń filtr ${pill.label}`} onPress={pill.remove} className="h-8 flex-row items-center gap-2 rounded-full border bg-primary-soft pr-2.5 pl-3.5 active:opacity-80" style={{ borderColor: primary }}>
                <Text className="font-sans-semibold text-[13px] text-foreground">{pill.label}</Text>
                <X color={foreground} size={14} />
              </Pressable>
            ))}
          </View>
        )}
        {results.error && <ErrorText>Nie udało się wyszukać gier: {results.error.message}</ErrorText>}
        {query.length < 2 && <EmptyState label="Wyszukiwanie" title="Wpisz nazwę gry" text="Wpisz co najmniej dwa znaki i zatwierdź, żeby zobaczyć wszystkie wyniki." />}
        {found && visible.length === 0 && (
          <EmptyState
            label="Brak wyników"
            title={found.length === 0 ? `Nic nie znaleziono dla „${query}”` : "Żadna gra nie pasuje do filtrów"}
            text={found.length === 0 ? "Sprawdź pisownię albo opisz grę innymi słowami, np. gatunkiem lub klimatem." : "Poluzuj kryteria albo wyczyść filtry, żeby wrócić do pełnej listy wyników."}
            action={found.length > 0 ? <Button onPress={() => setFilters(DEFAULT_SEARCH_FILTERS)}>Wyczyść filtry</Button> : undefined}
          />
        )}
        {query.length > 1 && results.isPending && <View className="gap-6">{[0, 1].map((i) => <GameCardSkeleton key={i} />)}</View>}
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={visible}
        keyExtractor={(game) => String(game.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListFooterComponent={<View className="h-6" />}
        renderItem={({ item }) => (
          <View className="px-4 pb-6">
            <GameCard
              game={item}
              friend={friends?.[item.id]}
              following={follows.data?.has(item.id) ?? false}
              list={lists.data?.[item.id] ?? null}
              onFollow={(follow) => toggleFollow.mutate({ gameId: item.id, follow })}
              onListChange={(list) => setList.mutate({ gameId: item.id, list })}
              onOpen={() => router.push(`/games/${item.id}`)}
            />
          </View>
        )}
        className="flex-1 bg-background"
      />
      <FilterSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} filters={filters} onChange={setFilters} onReset={reset} sorts={SEARCH_SORTS} facets={facets} summary={found ? gamesCount(visible.length) : undefined} />
    </>
  );
}
