import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";

type SpotlightCardProps = { children: ReactNode; className?: string; spotlightColor?: string };

export function SpotlightCard({ children, className, spotlightColor = "rgba(245, 233, 10, 0.14)" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const follow = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    ref.current?.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={follow}
      style={{ "--spot-color": spotlightColor } as React.CSSProperties}
      className={cn(
        "group/spotlight relative overflow-hidden rounded-xl bg-card/60 ring-1 ring-border transition duration-300 hover:-translate-y-0.5 hover:ring-rating/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color), transparent 70%)" }}
      />
      {children}
    </div>
  );
}
