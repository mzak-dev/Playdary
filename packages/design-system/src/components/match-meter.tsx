type MatchMeterProps = { value: number | null };

export function MatchMeter({ value }: MatchMeterProps) {
  if (value === null) return <span className="text-[13px] leading-[18px] text-muted-foreground">Brak wspólnych ocen</span>;
  const percent = Math.round(value * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[13px] leading-[18px] text-muted-foreground">
        <span>Zgodność gustu</span>
        <strong className="font-bold text-foreground tabular-nums">{percent}%</strong>
      </div>
      <div role="meter" aria-label="Zgodność gustu" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-1.5 overflow-hidden rounded-full bg-input/40">
        <i className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
