import type { SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-9 cursor-pointer rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground outline-none hover:bg-accent", className)}
      {...props}
    />
  );
}
