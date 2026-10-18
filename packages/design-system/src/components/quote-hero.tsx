import { animate, stagger } from "animejs";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import DotGrid from "./dot-grid";

export type Quote = { text: string; game: string; year: number };

type QuoteHeroProps = { user: string; quotes: Quote[]; interval?: number; onOpenGame?: () => void; children?: ReactNode };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function QuoteHero({ user, quotes, interval = 9000, onOpenGame, children }: QuoteHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const quote = quotes[index % quotes.length];
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (paused || reduced || quotes.length < 2) return;
    const id = setInterval(() => setIndex((n) => (n + 1) % quotes.length), interval);
    return () => clearInterval(id);
  }, [paused, reduced, quotes.length, interval]);

  useEffect(() => {
    if (reduced || !quoteRef.current) return;
    const animation = animate(quoteRef.current.querySelectorAll("[data-word]"), {
      opacity: [0, 1],
      translateY: [16, 0],
      filter: ["blur(8px)", "blur(0px)"],
      delay: stagger(70),
      duration: 650,
      ease: "outCubic",
    });
    return () => {
      animation.cancel();
    };
  }, [index, reduced]);

  if (!quote) return null;

  return (
    <section
      aria-label="Cytat z gry"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative -mt-[68px] overflow-hidden px-4 pt-[108px] pb-[120px] sm:px-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_55%,rgba(0,0,0,0.25))]">
        <DotGrid dotSize={3} gap={25} baseColor="#a1a1aa" activeColor="#1fa9ec" opacity={0.35} proximity={150} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <i className="absolute top-[-80px] left-[6%] size-[340px] rounded-full bg-primary opacity-[0.28] blur-[80px]" />
        <i className="absolute top-[30px] right-[4%] size-[300px] rounded-full bg-cover-rose opacity-[0.28] blur-[80px]" />
      </div>
      <div className="relative z-[2] flex flex-col gap-5">
        <span className="text-sm leading-5 font-medium text-muted-foreground">
          Witaj,{" "}
          <strong className="animate-[shine_3.2s_linear_infinite] bg-[linear-gradient(110deg,var(--foreground)_35%,var(--primary)_50%,var(--foreground)_65%)] bg-[length:250%_100%] bg-clip-text font-bold text-transparent">
            {user}
          </strong>
        </span>
        <h1 key={index} ref={quoteRef} aria-label={quote.text} className="max-w-[15ch] font-display text-[clamp(36px,9vw,56px)] leading-[1.04] font-extrabold tracking-tight">
          {quote.text.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span data-word aria-hidden className={reduced ? "inline-block" : "inline-block opacity-0"}>
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <span className="inline-flex items-center gap-2.5 text-sm leading-5 font-semibold text-muted-foreground before:h-[3px] before:w-7 before:rounded-sm before:bg-foreground">
            {quote.game} · {quote.year}
          </span>
          <Button variant="secondary" onClick={onOpenGame}>
            Zobacz grę
          </Button>
        </div>
      </div>
      {children && <div className="relative z-[2] mt-9 -mx-4 sm:-mx-8">{children}</div>}
    </section>
  );
}
