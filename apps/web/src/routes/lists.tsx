import { Button, GameRow, PageHero, SegmentedControl, Skeleton, Tag, type GameList } from "@playdary/design-system";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { requireSession } from "../lib/auth";
import { useFriends } from "../lib/games";
import { useListedGames, useSetList, useUserLists } from "../lib/library";

export const Route = createFileRoute("/lists")({
  beforeLoad: async () => ({ session: await requireSession() }),
  component: Lists,
});

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

function Lists() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const userId = session.user.id;
  const listed = useListedGames(userId);
  const lists = useUserLists(userId);
  const setList = useSetList(userId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["label"]>("Wszystkie");
  const active = FILTERS.find((item) => item.label === filter)?.id ?? "all";

  const rows = useMemo(
    () => (listed.data ?? []).filter((game) => lists.data?.[game.id]).sort((a, b) => a.title.localeCompare(b.title, "pl")),
    [listed.data, lists.data],
  );
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
    <AppShell session={session} active="lists">
      <PageHero className="pb-[104px]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <h1 className="font-display text-[clamp(32px,8vw,48px)] leading-[1.05] font-extrabold tracking-tight">Moje listy</h1>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Tag key={item.id}>
                {item.label} {counts[item.id] ?? 0}
              </Tag>
            ))}
          </div>
        </div>
        <div>
          <SegmentedControl label="Filtr list" items={FILTERS.map((item) => item.label)} value={filter} onChange={setFilter} />
        </div>
      </PageHero>

      <div className="relative z-[3] -mt-[72px] min-h-[55vh] rounded-t-xl border border-b-0 border-white/5 bg-card/70 px-4 pt-10 pb-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-8">
        {listed.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać list: {listed.error.message}</p>}

        {pending && (
          <div aria-hidden className="flex flex-col gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-[60px] w-[88px] shrink-0" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3.5 w-1/4" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!pending && visible.length === 0 && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg bg-secondary/60 p-8 text-center">
            <Tag>{filter}</Tag>
            <p className="font-display text-xl leading-[26px] font-bold">{empty.title}</p>
            <p className="text-sm leading-5 text-muted-foreground">{empty.text}</p>
            <Button onClick={() => navigate({ to: "/" })}>Przeglądaj popularne</Button>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {visible.map((game) => (
            <GameRow
              key={game.id}
              game={game}
              friend={friends?.[game.id]}
              list={lists.data?.[game.id] ?? null}
              onListChange={(list) => setList.mutate({ gameId: game.id, list })}
              onOpen={() => navigate({ to: "/games/$gameId", params: { gameId: String(game.id) } })}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
