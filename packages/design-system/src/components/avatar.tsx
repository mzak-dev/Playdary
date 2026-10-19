import { cn } from "../lib/cn";

type AvatarProps = { name: string; size?: "sm" | "md" | "lg"; className?: string };

const SIZES = {
  sm: "size-[26px] text-[11px] font-bold",
  md: "size-10 text-sm font-bold",
  lg: "size-24 font-display text-[40px] leading-none font-extrabold",
};

export const Avatar = ({ name, size = "md", className }: AvatarProps) => (
  <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-accent text-accent-foreground uppercase", SIZES[size], className)}>
    {name.charAt(0)}
  </span>
);
