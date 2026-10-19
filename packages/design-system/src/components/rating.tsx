import { useState } from "react";
import { cn } from "../lib/cn";

type RatingProps = { value: number; onChange?: (value: number) => void; disabled?: boolean; readOnly?: boolean };

export function Rating({ value, onChange, disabled, readOnly }: RatingProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="inline-flex items-center gap-3">
      <div role="radiogroup" aria-label="Twoja ocena" className="inline-flex" onMouseLeave={() => setHovered(0)}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`Oceń ${n} z 10`}
            disabled={disabled}
            tabIndex={readOnly ? -1 : undefined}
            onMouseEnter={() => !readOnly && setHovered(n)}
            onFocus={() => !readOnly && setHovered(n)}
            onBlur={() => setHovered(0)}
            onClick={() => !readOnly && onChange?.(n === value ? 0 : n)}
            className={cn(
              readOnly ? "pointer-events-none" : "cursor-pointer disabled:cursor-not-allowed",
              "relative h-7 w-[18px] before:absolute before:inset-x-[3px] before:top-2.5 before:h-2 before:rounded-sm before:transition-colors",
              n <= shown ? "before:bg-rating" : "before:bg-input",
            )}
          />
        ))}
      </div>
      <span className="min-w-12 font-display text-[15px] leading-[22px] font-bold tabular-nums">{shown ? `${shown}/10` : "Oceń"}</span>
    </div>
  );
}
