import { Avatar, Button, CountUp, MatchMeter, Reveal, Skeleton } from "@playdary/design-system";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useFriendCards, useMyFriends, useRatedGames, averageScore, histogram, ratingsCount, topGenres } from "@playdary/core";

const Card = ({ title, action, className = "", index = 0, children }: { title: string; action?: ReactNode; className?: string; index?: number; children: ReactNode }) => (
  <Reveal index={index} className={`flex ${className}`}>
    <section className="flex w-full flex-col gap-4 rounded-lg bg-secondary p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs leading-4 font-bold tracking-wider text-primary uppercase">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  </Reveal>
);

export function Overview({ userId, onShowRatings }: { userId: string; onShowRatings: () => void }) {
  const navigate = useNavigate();
  const rated = useRatedGames(userId);
  const friends = useMyFriends(userId);
  const cards = useFriendCards();
  const openGame = (id: number) => navigate({ to: "/games/$gameId", params: { gameId: String(id) } });

  if (rated.isPending) return <Skeleton aria-hidden className="h-72 rounded-lg" />;
  if (rated.error) return <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać ocen: {rated.error.message}</p>;

  const ratings = rated.data;
  const counts = histogram(ratings);
  const peak = Math.max(1, ...counts);
  const average = averageScore(ratings);
  const genres = topGenres(ratings);
  const mostGenres = Math.max(1, ...genres.map(([, n]) => n));
  const bestMatches = [...(cards.data ?? [])].filter((card) => card.match !== null).sort((a, b) => b.match! - a.match!).slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-6">
      <Card title="Twój gust" className="md:col-span-3">
        {average === null ? (
          <p className="text-muted-foreground">Oceń pierwszą grę, żeby zobaczyć swój gust.</p>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <b className="font-display text-5xl leading-none font-extrabold tabular-nums text-rating"><CountUp to={average} decimals={1} />
              </b>
              <span className="text-sm text-muted-foreground">średnia z {ratingsCount(ratings.length)}</span>
            </div>
            <div role="img" aria-label="Rozkład Twoich ocen od 1 do 10" className="grid h-28 grid-cols-10 items-end gap-1.5">
              {counts.map((n, i) => (
                <div key={i} className="flex h-full flex-col justify-end gap-1.5 text-center text-[11px] leading-none text-muted-foreground">
                  <i className="block min-h-[3px] rounded-sm bg-rating" style={{ height: `${(n / peak) * 100}%`, opacity: n ? 1 : 0.25 }} />
                  {i + 1}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card title="Twoja półka" index={1} className="md:col-span-3" action={<span className="text-[13px] text-muted-foreground">Najwyżej ocenione</span>}>
        {ratings.length === 0 && <p className="text-muted-foreground">Nie oceniono jeszcze żadnej gry.</p>}
        <div className="grid grid-cols-3 gap-3">
          {ratings.slice(0, 3).map(({ game, score }) => (
            <button key={game.id} type="button" aria-label={`${game.title}, ocena ${score} z 10`} onClick={() => openGame(game.id)} className="group relative aspect-[3/4] overflow-hidden rounded-md bg-accent text-left">
              {game.cover && <img src={game.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105" />}
              <span className="absolute top-2 left-2 rounded-full bg-background px-2 py-0.5 font-display text-sm font-bold text-rating">{score}</span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8 text-[13px] leading-4 font-semibold text-white">{game.title}</span>
            </button>
          ))}
        </div>
        {ratings.length > 3 && (
          <div>
            <Button variant="ghost" size="sm" onClick={onShowRatings}>
              Wszystkie oceny
            </Button>
          </div>
        )}
      </Card>

      <Card title="Ulubione gatunki" index={2} className="md:col-span-2">
        {genres.length === 0 && <p className="text-muted-foreground">Pojawią się po pierwszych ocenach.</p>}
        <div className="flex flex-col gap-3">
          {genres.map(([name, n]) => (
            <div key={name} className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
              <span className="truncate font-medium">{name}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-input/40">
                <i className="block h-full rounded-full bg-primary" style={{ width: `${(n / mostGenres) * 100}%` }} />
              </div>
              <b className="tabular-nums">{n}</b>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={`Znajomi · ${friends.data?.length ?? 0}`}
        index={3}
        className="md:col-span-4"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/friends", search: { tab: "Znajomi" } })}>
            Wszyscy
          </Button>
        }
      >
        {friends.data?.length === 0 && <p className="text-muted-foreground">Nie masz jeszcze znajomych.</p>}
        {friends.error && <p role="alert" className="text-sm font-medium text-destructive">Nie udało się wczytać znajomych: {friends.error.message}</p>}
        <div className="flex -space-x-2">
          {friends.data?.slice(0, 8).map((friend) => (
            <Avatar key={friend.id} name={friend.username} className="ring-2 ring-secondary" />
          ))}
        </div>
        {bestMatches.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] text-muted-foreground">Najbardziej zgodny gust</span>
            {bestMatches.map((card) => (
              <div key={card.id} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-center gap-4">
                <span className="truncate text-[15px] font-semibold">{card.username}</span>
                <MatchMeter value={card.match} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
