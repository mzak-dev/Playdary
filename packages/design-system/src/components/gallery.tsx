import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

const TrailerPlayer = lazy(() => import("./trailer-player"));

export type Slide =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; poster: string; videoId: string; alt: string };

export function Gallery({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);

  const goTo = (target: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(next);
    if (playing !== null && next !== playing) setPlaying(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-xl bg-card">
        <div ref={track} tabIndex={0} role="region" aria-label="Galeria grafik" onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none]">
          {slides.map((slide, i) => (
            <div key={i} role="group" aria-label={slide.alt} className="relative aspect-[16/10] w-full shrink-0 snap-center">
              <img src={slide.kind === "image" ? slide.src : slide.poster} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} className="size-full object-cover" />
              {slide.kind === "video" && playing !== i && (
                <>
                  <span className="absolute top-4 left-4 rounded-full bg-background px-3 py-1 font-display text-[13px] leading-[18px] font-bold">Zwiastun</span>
                  <button
                    type="button"
                    aria-label="Odtwórz zwiastun"
                    onClick={() => setPlaying(i)}
                    className="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"
                  >
                    <Play aria-hidden fill="currentColor" className="size-7" />
                  </button>
                </>
              )}
              {slide.kind === "video" && playing === i && (
                <div className="absolute inset-0 bg-black">
                  <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
                    <TrailerPlayer videoId={slide.videoId} poster={slide.poster} />
                  </Suspense>
                  <Button size="sm" variant="secondary" className="absolute top-3 right-3 z-10" onClick={() => setPlaying(null)}>
                    Zamknij
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {slides.length > 1 && playing === null && (
          <>
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction === 1 ? "Następna grafika" : "Poprzednia grafika"}
                disabled={direction === 1 ? index >= slides.length - 1 : index <= 0}
                onClick={() => goTo(index + direction)}
                className={cn(
                  "absolute top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background transition hover:scale-[1.08] disabled:scale-100 disabled:opacity-35",
                  direction === 1 ? "right-4" : "left-4",
                )}
              >
                {direction === 1 ? <ChevronRight aria-hidden className="size-5" /> : <ChevronLeft aria-hidden className="size-5" />}
              </button>
            ))}
            <span aria-hidden className="absolute right-4 bottom-4 z-[2] rounded-full bg-background px-2.5 py-1 font-display text-[13px] leading-[18px] font-bold tabular-nums">
              {index + 1} / {slides.length}
            </span>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="flex flex-wrap justify-center">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Grafika ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className="grid h-6 w-7 place-items-center before:h-2 before:rounded-full before:bg-input before:transition-all aria-[current=true]:before:w-5 aria-[current=true]:before:bg-foreground before:w-2"
            >
              <span className="sr-only">{slide.alt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
