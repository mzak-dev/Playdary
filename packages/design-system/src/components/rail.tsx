import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

type RailProps = { title: string; subtitle?: string; children: ReactNode };

export function Rail({ title, subtitle, children }: RailProps) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * 320, behavior: "smooth" });

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-[13px] leading-[18px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={direction === 1 ? "Przewiń w prawo" : "Przewiń w lewo"}
              onClick={() => scroll(direction)}
              className="grid size-10 place-items-center rounded-full bg-secondary transition hover:scale-[1.06] hover:bg-accent"
            >
              {direction === 1 ? <ChevronRight aria-hidden className="size-[18px]" /> : <ChevronLeft aria-hidden className="size-[18px]" />}
            </button>
          ))}
        </div>
      </div>
      <div ref={track} tabIndex={0} role="region" aria-label={title} className="-mx-0.5 flex snap-x gap-4 overflow-x-auto px-0.5 pt-1.5 pb-3.5 [scrollbar-width:none] [&>*]:snap-start">
        {children}
      </div>
    </section>
  );
}
