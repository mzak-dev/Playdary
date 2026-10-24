type MatchRingProps = { value: number | null };

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MatchRing({ value }: MatchRingProps) {
  const percent = value === null ? null : Math.round(value * 100);

  return (
    <div role="meter" aria-label="Zgodność gustu" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined} className="relative grid size-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7" className="stroke-input/40" />
        {percent !== null && (
          <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)} className="stroke-primary transition-[stroke-dashoffset] duration-700" />
        )}
      </svg>
      <span className="flex flex-col items-center leading-none">
        <b className="font-display text-2xl font-extrabold tabular-nums">{percent === null ? "–" : `${percent}%`}</b>
        <small className="mt-1 text-[11px] text-muted-foreground">zgodności</small>
      </span>
    </div>
  );
}
