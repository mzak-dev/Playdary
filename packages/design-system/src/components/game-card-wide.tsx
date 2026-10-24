import { Check, Eye } from "lucide-react";
import type { Friend, Game, GameList } from "../types";
import { Button } from "./button";
import { FriendNotice } from "./friend-notice";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";
import { ScoreBadge } from "./score-badge";

type GameCardWideProps = {
  game: Game;
  friend?: Friend;
  list?: GameList | null;
  following?: boolean;
  onFollow?: (following: boolean) => void;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
};

export function GameCardWide({ game, friend, list = null, following = false, onFollow, onListChange, onOpen }: GameCardWideProps) {
  return (
    <article className="group relative flex min-w-0 gap-3.5 rounded-lg bg-card p-3 ring-1 ring-white/5 transition hover:-translate-y-[3px] hover:ring-primary/50 focus-within:ring-primary/50 sm:gap-[18px] sm:p-4">
      <div className="relative w-20 shrink-0 self-center overflow-hidden rounded-md shadow-pop sm:w-32 [&_img]:aspect-[3/4] [&_div]:aspect-[3/4]">
        <GameCover title={game.title} cover={game.cover} />
        <span className="absolute top-2 right-2 scale-75">
          <ScoreBadge value={game.score} />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <h3 className="line-clamp-2 font-display text-[17px] leading-[22px] font-extrabold sm:text-xl sm:leading-[25px]">{game.title}</h3>
        <p className="truncate text-[13px] leading-[18px] text-muted-foreground">{[game.platforms.slice(0, 3).join(", "), game.genres[0]].filter(Boolean).join(" · ")}</p>
        {friend && <FriendNotice {...friend} />}
        <div className="relative z-[3] mt-1 flex flex-wrap gap-2">
          <Button size="sm" variant={following ? "outline" : "primary"} aria-pressed={following} onClick={() => onFollow?.(!following)}>
            {following ? <Check aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            {following ? "Obserwujesz" : "Obserwuj"}
          </Button>
          <ListButton value={list} onChange={onListChange} />
        </div>
      </div>
      <button type="button" aria-label={`Otwórz: ${game.title}`} onClick={onOpen} className="absolute inset-0 z-[2] cursor-pointer rounded-lg" />
    </article>
  );
}
