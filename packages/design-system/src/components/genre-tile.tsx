import { igdbImage } from "../lib/igdb-image";

type GenreTileProps = { name: string; covers: string[]; onPick: () => void };

const FAN = ["-rotate-[9deg] translate-y-2", "z-[2]", "rotate-[9deg] translate-y-2"];

export function GenreTile({ name, covers, onPick }: GenreTileProps) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex min-w-0 flex-col gap-3 overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-secondary to-card p-2.5 text-left transition hover:-translate-y-[3px] hover:border-primary/60 sm:p-3.5"
    >
      <span aria-hidden className="flex h-[76px] justify-center sm:h-24">
        {covers.slice(0, 3).map((cover, i) => (
          <img
            key={cover}
            alt=""
            loading="lazy"
            src={igdbImage(cover, "t_cover_small")}
            className={`-mx-2.5 h-16 w-12 rounded-sm object-cover shadow-pop transition-transform sm:-mx-3 sm:h-[84px] sm:w-[62px] ${FAN[i]}`}
          />
        ))}
      </span>
      <span className="truncate font-display text-base leading-5 font-extrabold">{name}</span>
    </button>
  );
}
