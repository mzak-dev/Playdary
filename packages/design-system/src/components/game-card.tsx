import { Check, Eye } from "lucide-react";
import type { MouseEvent } from "react";
import { cn } from "../lib/cn";
import type { Friend, Game, GameList } from "../types";
import { Button } from "./button";
import { Countdown } from "./countdown";
import { FriendNotice } from "./friend-notice";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";
import { ScoreBadge } from "./score-badge";

type GameCardProps = {
  game: Game;
  rank?: number;
  friend?: Friend;
  list?: GameList | null;
  following?: boolean;
  onFollow?: (following: boolean) => void;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
  overlay?: boolean;
  className?: string;
};

const trackPointer = (e: MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
};

export function GameCard({ game, rank, friend, list = null, following = false, onFollow, onListChange, onOpen, overlay = false, className }: GameCardProps) {
  const meta = [game.genres.slice(0, 2).join(" · "), game.hypes ? `${game.hypes.toLocaleString("pl-PL")} obserwujących` : ""]
    .filter(Boolean)
    .join(" · ");

  const actions = (
    <div className="relative z-[3] flex flex-wrap gap-2">
      <Button size="sm" variant={following ? "outline" : "primary"} aria-pressed={following} onClick={() => onFollow?.(!following)}>
        {following ? <Check aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        {following ? "Obserwujesz" : "Obserwuj"}
      </Button>
      <ListButton value={list} onChange={onListChange} />
    </div>
  );

  if (overlay) {
    return (
      <article className={cn("group relative isolate flex flex-col overflow-hidden rounded-lg bg-card text-white transition-transform duration-200 hover:z-10 hover:-translate-y-[3px] focus-within:z-10", className)}>
        <GameCover title={game.title} cover={game.cover} className="aspect-[2/3] transition-transform duration-500 group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 via-40% to-transparent to-65%" />
        {rank && <span className="absolute top-3 left-3 z-[1] rounded-full bg-black/60 px-2.5 py-1 font-display text-[13px] leading-[18px] font-bold backdrop-blur-sm">#{rank}</span>}
        {game.score !== null && (
          <span className="absolute top-3 right-3 z-[1]">
            <ScoreBadge value={game.score} />
          </span>
        )}
        <button type="button" aria-label={`Otwórz: ${game.title}`} onClick={onOpen} className="absolute inset-0 z-[2] cursor-pointer" />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 z-[3] flex flex-col gap-2 rounded-md border border-white/10 bg-black/55 p-3 backdrop-blur-md [&_button]:pointer-events-auto">
          <h3 className="line-clamp-2 font-display text-base leading-5 font-bold">{game.title}</h3>
          <p className="truncate text-xs leading-4 text-white/70">{meta}</p>
          <Countdown to={game.releaseDate} compact />
          {actions}
          {friend && <FriendNotice {...friend} />}
        </div>
      </article>
    );
  }

  return (
    <article
      onMouseMove={trackPointer}
      className={cn(
        "group relative isolate flex flex-col rounded-lg bg-card text-card-foreground transition-transform duration-200 hover:z-10 hover:-translate-y-[3px] focus-within:z-10",
        "before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "before:[background:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,0%),rgba(245,233,10,0.12),transparent_70%)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <GameCover title={game.title} cover={game.cover} />
        {rank && <span className="absolute top-3 left-3 rounded-full bg-background px-2.5 py-1 font-display text-[13px] leading-[18px] font-bold">#{rank}</span>}
        {game.score !== null && (
          <span className="absolute top-3 right-3">
            <ScoreBadge value={game.score} />
          </span>
        )}
        <button type="button" aria-label={`Otwórz: ${game.title}`} onClick={onOpen} className="absolute inset-0 z-[2] cursor-pointer" />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-display text-xl leading-[26px] font-bold">{game.title}</h3>
        <p className="text-[13px] leading-[18px] text-muted-foreground">{meta}</p>
        <Countdown to={game.releaseDate} compact />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={following ? "outline" : "primary"} aria-pressed={following} onClick={() => onFollow?.(!following)}>
            {following ? <Check aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            {following ? "Obserwujesz" : "Obserwuj"}
          </Button>
          <ListButton value={list} onChange={onListChange} />
        </div>
        {friend && <FriendNotice {...friend} />}
      </div>
    </article>
  );
}
