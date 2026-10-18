import { cn } from "../lib/cn";

type SegmentedControlProps<T extends string> = {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({ items, value, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full bg-secondary p-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === value}
          onClick={() => onChange(item)}
          className={cn(
            "h-9 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97]",
            item === value ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
