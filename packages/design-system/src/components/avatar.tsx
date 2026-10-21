import { cn } from "../lib/cn";

type AvatarProps = { name: string; size?: "sm" | "md" | "lg"; status?: "playing"; className?: string };

const SIZES = {
  sm: "size-[26px] text-[11px] font-bold",
  md: "size-10 text-sm font-bold",
  lg: "size-24 font-display text-[40px] leading-none font-extrabold",
};

export function Avatar({ name, size = "md", status, className }: AvatarProps) {
  const circle = (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-accent text-accent-foreground uppercase", SIZES[size], !status && className)}>
      {name.charAt(0)}
    </span>
  );
  if (!status) return circle;

  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", className)}>
      {circle}
      <i className="absolute right-0 bottom-0 size-3 rounded-full bg-success ring-2 ring-card" />
    </span>
  );
}
