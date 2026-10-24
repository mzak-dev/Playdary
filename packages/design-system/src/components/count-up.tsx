import { animate } from "animejs";
import { useEffect, useRef } from "react";

type CountUpProps = { to: number; duration?: number; decimals?: number; className?: string };

export function CountUp({ to, duration = 900, decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const counter = { value: 0 };
    const animation = animate(counter, {
      value: to,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        element.textContent = counter.value.toFixed(decimals);
      },
    });
    return () => {
      animation.cancel();
    };
  }, [to, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {to.toFixed(decimals)}
    </span>
  );
}
