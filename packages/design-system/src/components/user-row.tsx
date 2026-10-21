import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "./avatar";

type UserRowProps = { name: string; subtitle?: string; actions?: ReactNode; className?: string };

export const UserRow = ({ name, subtitle, actions, className }: UserRowProps) => (
  <div className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-lg bg-secondary px-4 py-3", className)}>
    <Avatar name={name} />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="truncate text-[15px] leading-[22px] font-semibold">{name}</span>
      {subtitle && <span className="text-[13px] leading-[18px] text-muted-foreground">{subtitle}</span>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
