import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { pressed: boolean };

export function Chip({ pressed, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "h-8 rounded-full border px-3.5 text-[13px] leading-none font-semibold transition active:scale-[0.97]",
        pressed ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    />
  );
}
