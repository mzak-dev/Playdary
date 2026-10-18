import type { Game } from "../types";
import { Countdown } from "./countdown";

type ReleaseTickerProps = { games: Game[]; onOpen?: (id: number) => void };

export function ReleaseTicker({ games, onOpen }: ReleaseTickerProps) {
  return (
    <div
      aria-label="Najbliższe premiery"
      className="group/ticker overflow-hidden py-1.5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
    >
      <div className="flex w-max animate-[marquee_70s_linear_infinite] gap-1.5 group-focus-within/ticker:[animation-play-state:paused] group-hover/ticker:[animation-play-state:paused]">
        {[...games, ...games].map((game, i) => (
          <button
            key={`${game.id}-${i}`}
            type="button"
            aria-hidden={i >= games.length}
            tabIndex={i >= games.length ? -1 : 0}
            onClick={() => onOpen?.(game.id)}
            className="inline-flex h-9 items-center gap-2.5 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition before:size-1.5 before:rounded-full before:bg-primary hover:bg-white/10 hover:text-foreground focus-visible:bg-white/10"
          >
            <span className="font-bold text-foreground">{game.title}</span>
            <Countdown to={game.releaseDate} compact />
          </button>
        ))}
      </div>
    </div>
  );
}
