import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { igdbImage } from "../lib/igdb-image";
import { daysUntilLabel } from "../lib/release-label";
import type { Friend, Game, GameList } from "../types";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { Countdown } from "./countdown";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";

type FeaturedHeroProps = {
  games: Game[];
  following: (id: number) => boolean;
  list: (id: number) => GameList | null;
  friend?: (id: number) => Friend | undefined;
  onFollow: (id: number, follow: boolean) => void;
  onListChange: (id: number, list: GameList | null) => void;
  onOpen: (id: number) => void;
  interval?: number;
};

const premiereDate = (releaseDate: number | null) =>
  releaseDate ? new Date(releaseDate).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBA";

const friendsLabel = (n: number) => (n === 1 ? "1 Twojego znajomego" : `${n} Twoich znajomych`);

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function FeaturedHero({ games, following, list, friend, onFollow, onListChange, onOpen, interval = 7000 }: FeaturedHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = games.length;
  const game = games[index % Math.max(count, 1)];
  const step = (direction: 1 | -1) => setIndex((n) => (n + direction + count) % count);

  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return;
    const id = setTimeout(() => step(1), interval);
    return () => clearTimeout(id);
  }, [paused, count, interval, index]);

  if (!game) return null;
  const isFollowing = following(game.id);
  const fans = friend?.(game.id);
  const genres = game.genres.slice(0, 3).join(" · ");

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article
        aria-roledescription="karuzela"
        aria-label="Najbardziej wyczekiwana gra"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative isolate min-w-0 overflow-hidden rounded-3xl border border-[var(--nav-border)] bg-[#0b0b0f] shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
      >
        {game.cover && (
          <img aria-hidden alt="" src={igdbImage(game.cover, "t_cover_big")} className="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-50 blur-3xl saturate-150" />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,12,0.94)_0%,rgba(8,8,12,0.82)_34%,rgba(8,8,12,0.35)_62%,rgba(8,8,12,0.05)_100%),linear-gradient(to_top,rgba(8,8,12,0.75),transparent_40%)]" />
        <span aria-hidden className="pointer-events-none absolute top-1.5 right-7 -z-10 hidden font-display text-[clamp(100px,12vw,170px)] leading-none font-extrabold tracking-[-0.04em] text-transparent select-none [-webkit-text-stroke:2px_rgba(255,255,255,0.16)] sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div key={game.id} className="flex animate-in fade-in slide-in-from-bottom-4 gap-4 p-4 pb-20 duration-500 sm:items-center sm:gap-9 sm:px-9 sm:py-7 sm:pb-16 lg:h-[436px]">
          <div className="w-24 shrink-0 self-start overflow-hidden rounded-md shadow-pop ring-1 ring-white/10 sm:w-44 sm:self-center sm:rounded-lg lg:w-56 [&_img]:aspect-[3/4] [&_div]:aspect-[3/4]">
            <GameCover title={game.title} cover={game.cover} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:gap-2.5">
            <p className="text-xs leading-4 font-bold tracking-widest text-white/70 uppercase">
              <span className="mr-1.5 rounded-full bg-rating px-2 py-0.5 tracking-normal text-highlight-foreground">#{index + 1}</span>
              najbardziej wyczekiwana gra
            </p>
            <h2 className="max-w-[16ch] font-display text-[clamp(22px,6.4vw,52px)] leading-[1.05] font-extrabold tracking-tight break-words">{game.title}</h2>
            <p className="max-w-full truncate text-[13px] leading-[18px] text-white/70 sm:text-sm sm:leading-5">
              {game.developer}
              {game.developer && genres && <i className="mx-2 not-italic opacity-50">·</i>}
              {genres}
            </p>
            {game.summary && <p className="line-clamp-1 max-w-[52ch] text-[13px] leading-5 text-white/80 sm:line-clamp-2 sm:text-[15px] sm:leading-[23px]">{game.summary}</p>}
            <div className="my-0.5 max-w-full overflow-x-auto sm:my-1.5">
              <Countdown to={game.releaseDate} compact={false} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-sm leading-5 text-white/70">
              <span>
                <b className="font-bold text-white">Premiera:</b> {premiereDate(game.releaseDate)}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {game.platforms.slice(0, 4).map((platform) => (
                  <span key={platform} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-[3px] text-[11px] leading-4 font-bold text-white">
                    {platform}
                  </span>
                ))}
              </span>
            </div>
            {(game.hypes > 0 || fans) && (
              <div className="flex items-center gap-3 text-xs leading-4 font-semibold text-white/80 sm:text-[13px] sm:leading-[18px]">
                {fans && (
                  <span aria-hidden className="flex pl-2">
                    {fans.users.slice(0, 3).map((user) => (
                      <Avatar key={user.name} name={user.name} size="sm" className="-ml-2 size-7 ring-2 ring-[#121216]" />
                    ))}
                  </span>
                )}
                <span>
                  <b className="font-bold text-white">{game.hypes.toLocaleString("pl-PL")}</b> osób obserwuje
                  {fans && ` · w tym ${friendsLabel(fans.users.length)}`}
                </span>
              </div>
            )}
            <div className="mt-1 flex flex-wrap gap-2 max-sm:-ml-[112px] max-sm:pt-4 max-sm:w-[calc(100%+112px)]">
              <Button size="md" variant={isFollowing ? "outline" : "primary"} aria-pressed={isFollowing} onClick={() => onFollow(game.id, !isFollowing)}>
                {isFollowing ? "Obserwujesz" : "Obserwuj"}
              </Button>
              <ListButton size="md" value={list(game.id)} onChange={(value) => onListChange(game.id, value)} />
              <Button size="md" variant="ghost" onClick={() => onOpen(game.id)}>
                Szczegóły
              </Button>
            </div>
          </div>
        </div>
        {count > 1 && (
          <>
            <span aria-hidden className="absolute bottom-7 left-4 h-[3px] w-[40%] max-w-64 overflow-hidden rounded-sm bg-white/20 sm:left-9">
              <i key={`${game.id}-${paused}`} className={cn("block h-full origin-left bg-white", !paused && "animate-[hero-progress_linear_both]")} style={{ animationDuration: `${interval}ms` }} />
            </span>
            <div className="absolute right-3 bottom-3 flex items-center gap-2 sm:right-5 sm:bottom-4">
              <button type="button" aria-label="Poprzednia gra" onClick={() => step(-1)} className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition hover:bg-white/20">
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <span className="text-[13px] font-bold tabular-nums">
                {index + 1} / {count}
              </span>
              <button type="button" aria-label="Następna gra" onClick={() => step(1)} className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition hover:bg-white/20">
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          </>
        )}
      </article>

      <div role="group" aria-label="Top 10 najbardziej wyczekiwanych" className="flex min-w-0 flex-col gap-2 rounded-3xl border border-[var(--nav-border)] bg-[var(--nav-bg)] p-2.5 backdrop-blur-[18px] lg:relative lg:p-3.5">
        <p className="flex items-baseline justify-between px-2 pt-1 font-display text-sm font-bold lg:pt-0">
          Najbardziej wyczekiwane <span className="text-xs font-medium text-muted-foreground">wg obserwujących</span>
        </p>
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] lg:absolute lg:inset-x-2.5 lg:top-[50px] lg:bottom-2.5 lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-auto lg:[scrollbar-width:thin]">
          {games.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={i === index}
              aria-label={`#${i + 1} ${item.title}`}
              onClick={() => setIndex(i)}
              className={cn(
                "flex w-44 shrink-0 items-center gap-2.5 rounded-xl border p-1.5 pr-2.5 text-left transition-colors hover:bg-white/5 sm:w-52 lg:w-full",
                i === index ? "border-primary/70 bg-white/10" : "border-transparent",
              )}
            >
              <span className="w-5 shrink-0 text-center font-display text-sm font-extrabold text-muted-foreground">{i + 1}</span>
              <span className="h-[50px] w-[38px] shrink-0 overflow-hidden rounded-md bg-secondary">
                {item.cover && <img alt="" loading="lazy" src={igdbImage(item.cover, "t_cover_small")} className="size-full object-cover" />}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-display text-[13px] leading-[17px] font-bold">{item.title}</span>
                <span className="text-[11px] leading-[14px] font-semibold text-primary">{daysUntilLabel(item.releaseDate)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
