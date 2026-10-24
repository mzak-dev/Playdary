import { animate, stagger } from "animejs";
import { Shuffle } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { PageHero } from "./page-hero";

export type Quote = { text: string; game: string; year: number };

type QuoteHeroProps = { user: string; quotes: Quote[]; interval?: number; compact?: boolean; onOpenGame?: () => void; children?: ReactNode };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function QuoteHero({ user, quotes, interval = 9000, compact = false, onOpenGame, children }: QuoteHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const quoteRef = useRef<HTMLHeadingElement>(null);
  const quote = quotes[index % quotes.length];
  const reduced = prefersReducedMotion();
  const showNext = () => setIndex((n) => (n + 1) % quotes.length);
  const showRandom = () => setIndex((n) => (n + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length);

  useEffect(() => {
    if (paused || reduced || quotes.length < 2) return;
    const id = setInterval(showNext, interval);
    return () => clearInterval(id);
  }, [paused, reduced, quotes.length, interval, index]);

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
    <PageHero
      aria-label="Cytat z gry"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={compact ? "pb-[96px]" : "pb-[120px]"}
    >
      <>
        <span className="text-sm leading-5 font-medium text-muted-foreground">
          Witaj,{" "}
          <strong className="animate-[shine_3.2s_linear_infinite] bg-[linear-gradient(110deg,var(--foreground)_35%,var(--primary)_50%,var(--foreground)_65%)] bg-[length:250%_100%] bg-clip-text font-bold text-transparent">
            {user}
          </strong>
        </span>
        <h1 key={index} ref={quoteRef} aria-label={quote.text} className={compact ? "max-w-[60ch] font-display text-[clamp(18px,4.6vw,24px)] leading-[1.25] font-bold tracking-tight" : "max-w-[45ch] font-display text-[clamp(36px,9vw,56px)] leading-[1.04] font-extrabold tracking-tight"}>
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
          {!compact && (
            <Button variant="secondary" onClick={onOpenGame}>
              Zobacz grę
            </Button>
          )}
          {quotes.length > 1 && (
            <Button variant="ghost" size="sm" aria-label="Losuj cytat" title="Losuj cytat" onClick={showRandom} className="size-8 px-0 text-muted-foreground opacity-40 hover:opacity-100 focus-visible:opacity-100">
              <Shuffle size={16} aria-hidden />
            </Button>
          )}
        </div>
        {children && <div className={compact ? "flex min-w-0 flex-col gap-4" : "mt-4 -mx-4 sm:-mx-8"}>{children}</div>}
      </>
    </PageHero>
  );
}
