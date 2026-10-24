import { ActivityItem, Avatar, Button, SegmentedControl, Skeleton } from "@playdary/design-system";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PRIVACY, useProfile, relativeTime, useFriendActivity, useFriendCards, type FriendEvent } from "@playdary/core";
import { Panel, SectionHeading } from "../panel";

const FILTERS = ["Wszystko", "Oceny", "Ukończone", "Obserwowane"] as const;

const MATCHES: Record<(typeof FILTERS)[number], (event: FriendEvent) => boolean> = {
  Wszystko: () => true,
  Oceny: (event) => event.kind === "rated",
  Ukończone: (event) => event.kind === "done",
  Obserwowane: (event) => event.kind === "follow" || event.kind === "wish",
};

const privacyLabel = (value: string | undefined) => Object.keys(PRIVACY).find((label) => PRIVACY[label] === value) ?? "Znajomi";

export function ActivityTab({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const activity = useFriendActivity();
  const cards = useFriendCards();
  const profile = useProfile(userId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Wszystko");
  const events = (activity.data ?? []).filter(MATCHES[filter]);
  const playing = (cards.data ?? []).filter((card) => card.playing);
  const openGame = (gameId: number) => navigate({ to: "/games/$gameId", params: { gameId: String(gameId) } });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading>Aktywność znajomych</SectionHeading>
          <SegmentedControl label="Filtr aktywności" items={FILTERS} value={filter} onChange={setFilter} />
        </div>
        {activity.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać aktywności: {activity.error.message}</p>}
        {activity.isPending && (
          <div aria-hidden className="flex flex-col gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-2.5">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-[60px] w-[88px]" />
              </div>
            ))}
          </div>
        )}
        {activity.data && events.length === 0 && (
          <p className="py-6 text-muted-foreground">Brak aktywności w tej kategorii. Gdy znajomi coś ocenią, ukończą lub zaczną obserwować, zobaczysz to tutaj.</p>
        )}
        <div className="flex flex-col gap-0.5">
          {events.map((event) => (
            <ActivityItem
              key={`${event.friendId}-${event.kind}-${event.gameId}`}
              name={event.username}
              when={relativeTime(event.createdAt)}
              kind={event.kind}
              score={event.score}
              game={{ title: event.gameName, cover: event.cover }}
              onOpen={() => openGame(event.gameId)}
            />
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <Panel title="Teraz grają">
          {playing.length === 0 && <p className="text-sm text-muted-foreground">Nikt ze znajomych teraz nie gra.</p>}
          <div className="flex flex-col gap-3.5">
            {playing.map((card) => (
              <button key={card.id} type="button" onClick={() => card.playing && openGame(card.playing.id)} className="flex items-center gap-3 text-left">
                <Avatar name={card.username} status="playing" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] leading-[22px] font-semibold">{card.username}</span>
                  <span className="truncate text-[13px] leading-[18px] text-muted-foreground">{card.playing?.name}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Prywatność">
          <p className="text-sm leading-[21px] text-muted-foreground">
            Twoje listy i oceny widzą: <strong className="text-foreground">{privacyLabel(profile.data?.privacy)}</strong>. Znajomi dowiadują się, gdy coś ocenisz lub ukończysz.
          </p>
          <div>
            <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/profile", search: { section: "Ustawienia" } })}>
              Zmień w ustawieniach
            </Button>
          </div>
        </Panel>
      </aside>
    </div>
  );
}
