import type { Game, GameList } from "../types";
import { cn } from "../lib/cn";
import { CountUp } from "./count-up";
import { GameRow } from "./game-row";
import { SpotlightCard } from "./spotlight-card";

type RatedGameRowProps = {
  game: Game;
  score: number;
  list?: GameList | null;
  onListChange?: (list: GameList | null) => void;
  onOpen?: () => void;
};

export function RatedGameRow({ game, score, list, onListChange, onOpen }: RatedGameRowProps) {
  return (
    <SpotlightCard className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <div className="min-w-0 flex-[1_1_min(560px,100%)]">
        <GameRow game={game} list={list} onListChange={onListChange} onOpen={onOpen} />
      </div>
      <div role="img" aria-label={`Twoja ocena: ${score} z 10`} className="flex items-center gap-4 px-4 pb-3 sm:py-3">
        <div className="flex items-baseline gap-0.5 font-display font-bold tabular-nums">
          <CountUp to={score} className="text-[32px] leading-8 text-rating" />
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
        <div aria-hidden className="flex gap-[3px]">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn("h-5 w-1.5 origin-bottom animate-[bar-in_400ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-sm motion-reduce:animate-none", i < score ? "bg-rating" : "bg-input")}
            />
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}
