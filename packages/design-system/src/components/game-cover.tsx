import { cn } from "../lib/cn";
import { igdbImage } from "@playdary/core";

const TONES = ["bg-cover-ember", "bg-cover-teal", "bg-cover-rose", "bg-cover-lime", "bg-cover-sky"];

const toneFor = (title: string) => {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return TONES[hash % TONES.length];
};

const initials = (title: string) =>
  title
    .split(" ")
    .filter((word) => /^[\p{L}\d]/u.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

type GameCoverProps = { title: string; cover: string | null; thumb?: boolean; className?: string };

export function GameCover({ title, cover, thumb = false, className }: GameCoverProps) {
  const shape = thumb ? "h-[60px] w-[88px] shrink-0 rounded-md" : "aspect-[16/10] w-full";

  if (cover) {
    return (
      <img
        src={igdbImage(cover, thumb ? "t_cover_small" : "t_cover_big_2x")}
        alt={`Okładka: ${title}`}
        loading="lazy"
        className={cn(shape, "bg-secondary object-cover object-top", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Okładka: ${title}`}
      className={cn(shape, "flex overflow-hidden text-highlight-foreground", toneFor(title), thumb ? "items-center justify-center" : "items-end p-4", className)}
    >
      <span className={cn("font-display leading-none font-extrabold tracking-tight", thumb ? "text-lg" : "max-w-[12ch] text-[26px] break-words")}>
        {thumb ? initials(title) : title}
      </span>
    </div>
  );
}
