import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ to, compact = false }: { to: number | null; compact?: boolean }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!to) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (!to) return <span className="text-[13px] text-muted-foreground">Data premiery: TBA</span>;
  const diff = to - now;
  if (diff <= 0) return <span className="text-sm font-bold text-success">Już dostępna</span>;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (compact) {
    return (
      <span role="timer" className="font-display text-sm font-bold text-primary tabular-nums">
        {days} d {pad(hours)} h {pad(minutes)} m
      </span>
    );
  }

  const segments = [
    [String(days), "dni"],
    [pad(hours), "godz."],
    [pad(minutes), "min"],
    [pad(seconds % 60), "sek"],
  ] as const;

  return (
    <div role="timer" className="inline-flex gap-2">
      {segments.map(([value, unit]) => (
        <div key={unit} className="flex min-w-14 flex-col items-center rounded-md bg-secondary px-1.5 py-2">
          <span className="font-display text-[28px] leading-7 font-bold tabular-nums">{value}</span>
          <span className="mt-1 text-[11px] tracking-wider text-muted-foreground uppercase">{unit}</span>
        </div>
      ))}
    </div>
  );
}
