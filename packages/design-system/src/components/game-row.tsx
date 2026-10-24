import type { Friend, Game, GameList } from "../types";
import { FriendNotice } from "./friend-notice";
import { GameCover } from "./game-cover";
import { ListButton } from "./list-button";
import { ScoreBadge } from "./score-badge";

type GameRowProps = {
  game: Game;
  friend?: Friend;
  list?: GameList | null;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
};

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

export function GameRow({ game, friend, list = null, onListChange, onOpen }: GameRowProps) {
  return (
    <div className="group relative flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg px-3 py-3 transition-colors hover:z-10 hover:bg-card focus-within:z-10 sm:flex-nowrap sm:px-4">
      <button type="button" aria-label={`Otwórz: ${game.title}`} onClick={onOpen} className="absolute inset-y-0 left-0 z-[6] w-full cursor-pointer rounded-lg sm:w-[calc(100%-360px)] sm:min-w-[40%]" />
      <GameCover thumb title={game.title} cover={game.cover} />
      <div className="flex min-w-0 flex-1 basis-[calc(100%-200px)] flex-col items-start gap-1 sm:basis-auto">
        <span className="text-base leading-[22px] font-semibold">{game.title}</span>
        <span className="text-[13px] leading-[18px] text-muted-foreground">{[game.platforms.slice(0, 3).join(", "), game.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}</span>
        {friend && <FriendNotice {...friend} />}
      </div>
      <ScoreBadge value={game.score} />
      {game.releaseDate && <span className="hidden min-w-[100px] text-right text-[13px] leading-[18px] font-medium text-muted-foreground sm:block">{formatDate(game.releaseDate)}</span>}
      <div className="relative z-[7] max-sm:ml-[104px]">
        <ListButton value={list} onChange={onListChange} />
      </div>
    </div>
  );
}
