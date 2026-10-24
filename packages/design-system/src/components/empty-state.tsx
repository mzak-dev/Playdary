import type { ReactNode } from "react";
import { igdbImage } from "@playdary/core";
import GridMotion from "./grid-motion";
import { Tag } from "./tag";

type EmptyStateProps = { label: string; title: string; text: string; covers: string[]; action?: ReactNode };

export function EmptyState({ label, title, text, covers, action }: EmptyStateProps) {
  return (
    <div className="relative isolate min-h-[480px] overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <GridMotion items={covers.map((cover) => igdbImage(cover))} aspectRatio={0.75} gap={14} angle={-12} speed={22} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center p-6">
        <div className="pointer-events-auto flex max-w-[420px] flex-col items-center gap-3 rounded-xl border border-white/5 bg-[rgba(14,14,16,0.72)] px-7 pt-7 pb-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-[18px] backdrop-saturate-[1.4]">
          <Tag>{label}</Tag>
          <p className="font-display text-[22px] leading-7 font-bold">{title}</p>
          <p className="mb-1 text-sm leading-[22px] text-muted-foreground">{text}</p>
          {action}
        </div>
      </div>
    </div>
  );
}
