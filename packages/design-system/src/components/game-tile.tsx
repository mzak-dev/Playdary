import { igdbImage } from "../lib/igdb-image";
import { daysUntilLabel } from "../lib/release-label";
import type { Game } from "../types";
import { ScoreBadge } from "./score-badge";

type GameTileProps = { game: Game; position: number; onOpen?: () => void };

export function GameTile({ game, position, onOpen }: GameTileProps) {
  const upcoming = game.releaseDate !== null && game.releaseDate > Date.now();
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null;

  return (
    <div className="relative flex items-center gap-3 rounded-md p-2 transition-colors focus-within:bg-white/5 hover:bg-white/5">
      <span className="w-[18px] shrink-0 text-center font-display text-[15px] font-extrabold text-muted-foreground">{position}</span>
      <span className="h-[59px] w-11 shrink-0 overflow-hidden rounded-sm bg-secondary">
        {game.cover && <img alt="" loading="lazy" src={igdbImage(game.cover, "t_cover_small")} className="size-full object-cover" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-display text-sm leading-[19px] font-bold">{game.title}</span>
        <span className="truncate text-xs leading-4 text-muted-foreground">{[game.genres[0], year].filter(Boolean).join(" · ")}</span>
      </span>
      {upcoming ? (
        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] leading-4 font-bold text-primary">{daysUntilLabel(game.releaseDate)}</span>
      ) : (
        game.score !== null && <ScoreBadge value={game.score} />
      )}
      <button type="button" aria-label={`Otwórz: ${game.title}`} onClick={onOpen} className="absolute inset-0 cursor-pointer rounded-md" />
    </div>
  );
}
