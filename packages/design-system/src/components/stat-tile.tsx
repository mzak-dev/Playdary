type StatTileProps = { value: string; label: string };

export const StatTile = ({ value, label }: StatTileProps) => (
  <div className="flex min-w-24 flex-1 flex-col gap-0.5 rounded-md bg-secondary px-4 py-3">
    <span className="font-display text-xl leading-[26px] font-bold tabular-nums">{value}</span>
    <span className="text-xs leading-4 font-medium text-muted-foreground">{label}</span>
  </div>
);
