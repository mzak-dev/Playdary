import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-lg bg-secondary p-6">
      <h2 className="font-display text-xl leading-[26px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

export const SectionHeading = ({ children }: { children: ReactNode }) => <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-tight">{children}</h2>;
