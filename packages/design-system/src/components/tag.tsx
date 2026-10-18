import type { ReactNode } from "react";

export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs leading-[18px] font-semibold text-secondary-foreground">{children}</span>
);
