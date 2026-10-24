import { ActivityItem, Avatar, Button, MatchMeter, MatchRing, Skeleton, StatTile, Switch, TextField } from "@playdary/design-system";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { relativeTime, useFriendAction, useFriendCards, useFriendDetail, type FriendCard } from "@playdary/core";
import { Panel } from "../panel";

const sinceLabel = (since: number) => new Date(since).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const statusLabel = (card: FriendCard) => (card.playing ? `Gra w ${card.playing.name}` : `Znajomi od ${sinceLabel(card.since)}`);

export function FriendsTab({ userId }: { userId: string }) {
  const cards = useFriendCards();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = cards.data?.find((card) => card.id === selectedId);

  if (selected) return <FriendDetail userId={userId} card={selected} onBack={() => setSelectedId(null)} />;

  const needle = query.trim().toLowerCase();
  const visible = (cards.data ?? []).filter((card) => card.username.toLowerCase().includes(needle));

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-md">
        <TextField label="Szukaj wśród znajomych" type="search" autoComplete="off" placeholder="Nazwa użytkownika" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {cards.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać znajomych: {cards.error.message}</p>}
      {cards.isPending && (
        <div aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[156px] rounded-lg" />
          ))}
        </div>
      )}
      {cards.data && visible.length === 0 && (
        <p className="text-muted-foreground">{cards.data.length === 0 ? "Nie masz jeszcze znajomych. Dodaj kogoś w zakładce Dodaj." : "Brak znajomych pasujących do wyszukiwania."}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((card) => (
          <button key={card.id} type="button" aria-label={`Profil znajomego: ${card.username}`} onClick={() => setSelectedId(card.id)} className="flex flex-col gap-4 rounded-lg border border-transparent bg-secondary p-5 text-left transition duration-200 hover:-translate-y-[3px] hover:border-primary focus-visible:border-primary motion-reduce:transition-none">
            <span className="flex items-center gap-3.5">
              <Avatar name={card.username} status={card.playing ? "playing" : undefined} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-base leading-[22px] font-bold">{card.username}</span>
                <span className={`truncate text-[13px] leading-[18px] ${card.playing ? "font-medium text-success" : "text-muted-foreground"}`}>{statusLabel(card)}</span>
              </span>
            </span>
            <MatchMeter value={card.match} />
            <span className="text-[13px] leading-[18px] text-muted-foreground">
              {card.done === null ? "Lista ukryta" : `${card.done} ukończonych · ${card.rated ?? 0} ocen`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type DetailProps = { userId: string; card: FriendCard; onBack: () => void };

function FriendDetail({ userId, card, onBack }: DetailProps) {
  const navigate = useNavigate();
  const detail = useFriendDetail(card.id);
  const action = useFriendAction(userId);
  const [confirming, setConfirming] = useState(false);
  const openGame = (gameId: number) => navigate({ to: "/games/$gameId", params: { gameId: String(gameId) } });

  const remove = () => action.mutate({ kind: "end", otherId: card.id }, { onSuccess: onBack });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Wszyscy znajomi
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
        <Avatar name={card.username} size="lg" status={card.playing ? "playing" : undefined} />
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[32px] leading-[38px] font-extrabold tracking-tight">{card.username}</h2>
          <span className="text-[15px] leading-[22px] font-medium">{statusLabel(card)}</span>
          <span className="text-[13px] leading-[18px] text-muted-foreground">Znajomi od {sinceLabel(card.since)}</span>
        </div>
        <div className="sm:ml-auto">
          <MatchRing value={card.match} />
        </div>
      </div>
      {card.done === null && <p className="text-muted-foreground">{card.username} ukrywa swoje listy i oceny.</p>}
      <div className="flex flex-wrap gap-3">
        <StatTile value={String(card.done ?? "–")} label="Ukończone" />
        <StatTile value={String(card.rated ?? "–")} label="Ocenione" />
        <StatTile value={String(detail.data?.common.length ?? "–")} label="Wspólne gry" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex min-w-0 flex-col gap-3">
          <h3 className="font-display text-xl leading-[26px] font-bold">Ostatnia aktywność</h3>
          {detail.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać aktywności: {detail.error.message}</p>}
          {detail.data?.events.length === 0 && <p className="text-muted-foreground">Brak aktywności do pokazania.</p>}
          <div className="flex flex-col gap-0.5">
            {detail.data?.events.map((event) => (
              <ActivityItem
                key={`${event.kind}-${event.gameId}`}
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
          <Panel title="Wspólne gry">
            {detail.data?.common.length === 0 && <p className="text-sm text-muted-foreground">Jeszcze nie macie wspólnych gier na listach.</p>}
            <div className="flex flex-wrap gap-2">
              {detail.data?.common.map((game) => (
                <button key={game.id} type="button" onClick={() => openGame(game.id)} className="rounded-full bg-accent px-4 py-1.5 text-[13px] leading-[18px] font-semibold hover:brightness-110">
                  {game.name}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Opcje">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] leading-[22px] font-semibold">Wycisz aktywność</span>
                <span className="text-[13px] leading-[18px] text-muted-foreground">Ukryj tę osobę w kanale aktywności.</span>
              </div>
              <Switch label="Wycisz aktywność" checked={card.muted} onChange={(checked) => action.mutate({ kind: checked ? "mute" : "unmute", otherId: card.id })} />
            </div>
            {confirming ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-[21px] text-muted-foreground">Na pewno usunąć {card.username}? Przestaniecie widzieć swoje listy i oceny.</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={remove} disabled={action.isPending}>
                    Tak, usuń
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Anuluj
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Button variant="secondary" onClick={() => setConfirming(true)}>
                  Usuń ze znajomych
                </Button>
              </div>
            )}
            {action.error && <p role="alert" className="text-sm font-medium text-destructive">{action.error.message}</p>}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
