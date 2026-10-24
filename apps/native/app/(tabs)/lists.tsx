import { useFriends, useListedGames, useSetList, useUserLists, type GameList } from "@playdary/core";
import { Button, EmptyState, GameRow, SegmentedControl, Skeleton, Tag } from "@playdary/design-system-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { ErrorText } from "../../components/panel";
import { TabScreen } from "../../components/tab-screen";
import { useRequiredSession } from "../../lib/session";

const FILTERS: { label: string; id: GameList | "all" }[] = [
  { label: "Wszystkie", id: "all" },
  { label: "Gram", id: "playing" },
  { label: "Chcę zagrać", id: "wishlist" },
  { label: "Ukończone", id: "done" },
  { label: "Porzucone", id: "dropped" },
];

const EMPTY_TEXT: Record<GameList | "all", { title: string; text: string }> = {
  all: { title: "Nie masz jeszcze żadnych list", text: "Dodaj grę do listy na jej stronie albo na karcie, a pojawi się tutaj." },
  playing: { title: "Nic teraz nie grasz", text: "Gry oznaczone jako „Gram” trafią na tę listę." },
  wishlist: { title: "Lista życzeń jest pusta", text: "Oznacz gry, w które chcesz zagrać, żeby o nich nie zapomnieć." },
  done: { title: "Brak ukończonych gier", text: "Gry oznaczone jako „Ukończone” trafią na tę listę." },
  dropped: { title: "Brak porzuconych gier", text: "Gry, które odłożyłeś na bok, znajdziesz tutaj." },
};

export default function Lists() {
  const session = useRequiredSession();
  const router = useRouter();
  const userId = session.user.id;
  const listed = useListedGames(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["label"]>("Wszystkie");
  const active = FILTERS.find((item) => item.label === filter)?.id ?? "all";

  const rows = useMemo(() => (listed.data ?? []).filter((game) => lists.data?.[game.id]).sort((a, b) => a.title.localeCompare(b.title, "pl")), [listed.data, lists.data]);
  const counts = useMemo(() => {
    const result: Record<string, number> = { all: rows.length };
    for (const game of rows) {
      const list = lists.data?.[game.id];
      if (list) result[list] = (result[list] ?? 0) + 1;
    }
    return result;
  }, [rows, lists.data]);
  const visible = active === "all" ? rows : rows.filter((game) => lists.data?.[game.id] === active);
  const friends = useFriends(useMemo(() => visible.map((game) => game.id).sort((a, b) => a - b), [visible])).data;
  const pending = listed.isPending || lists.isPending;
  const empty = EMPTY_TEXT[active];

  return (
    <TabScreen
      title="Moje listy"
      hero={
        <>
          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Tag key={item.id}>{`${item.label} ${counts[item.id] ?? 0}`}</Tag>
            ))}
          </View>
          <SegmentedControl label="Filtr list" items={FILTERS.map((item) => item.label)} value={filter} onChange={setFilter} />
        </>
      }
    >
      {listed.error && <ErrorText>Nie udało się wczytać list: {listed.error.message}</ErrorText>}
      {pending && (
        <View accessibilityElementsHidden className="gap-1">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center gap-4 py-3">
              <Skeleton className="h-[60px] w-[88px] shrink-0" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3.5 w-1/4" />
              </View>
              <Skeleton className="size-10 rounded-full" />
            </View>
          ))}
        </View>
      )}
      {!pending && visible.length === 0 && <EmptyState label={filter} title={empty.title} text={empty.text} action={<Button onPress={() => router.navigate("/")}>Przeglądaj popularne</Button>} />}
      <View className="-mx-4 gap-1">
        {visible.map((game) => (
          <GameRow key={game.id} game={game} friend={friends?.[game.id]} list={lists.data?.[game.id] ?? null} onListChange={(list) => setList.mutate({ gameId: game.id, list })} onOpen={() => router.push(`/games/${game.id}`)} />
        ))}
      </View>
    </TabScreen>
  );
}
