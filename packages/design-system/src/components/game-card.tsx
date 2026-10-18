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
  onOpen?: () => void;
  className?: string;
};

const trackPointer = (e: MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
};

export function GameCard({ game, rank, friend, list = null, following = false, onFollow, onOpen, className }: GameCardProps) {
  const meta = [game.genres.slice(0, 2).join(" · "), game.follows ? `${game.follows.toLocaleString("pl-PL")} obserwujących` : ""]
    .filter(Boolean)
    .join(" · ");

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
          <ListButton value={list} />
        </div>
        {friend && <FriendNotice {...friend} />}
      </div>
    </article>
  );
}
