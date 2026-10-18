import { cn } from "../lib/cn";

const band = (score: number) =>
  score >= 75 ? "bg-success text-success-foreground" : score >= 50 ? "bg-highlight text-highlight-foreground" : "bg-destructive text-destructive-foreground";

export function ScoreBadge({ value }: { value: number | null }) {
  const rounded = value === null ? null : Math.round(value);
  return (
    <span
      role="img"
      aria-label={rounded === null ? "Brak oceny" : `Ocena ${rounded} na 100`}
      className={cn(
        "inline-grid size-10 place-items-center rounded-full font-display text-[15px] font-extrabold tabular-nums",
        rounded === null ? "bg-secondary text-muted-foreground" : band(rounded),
      )}
    >
      {rounded ?? "–"}
    </span>
  );
}
