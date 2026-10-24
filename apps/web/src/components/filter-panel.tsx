import { Chip, SegmentedControl, SelectField, Switch } from "@playdary/design-system";
import type { ReactNode } from "react";
import { GENRES, PERIODS, PLATFORMS, SCORES, SORTS, type Filters } from "@playdary/core";

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
    <span className="basis-[84px] text-xs leading-4 font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
    {children}
  </div>
);

type FilterPanelProps = { filters: Filters; onChange: (filters: Filters) => void };

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-white/5 bg-white/[0.03] p-4">
      <Row label="Platforma">
        {PLATFORMS.map((p) => (
          <Chip key={p.label} pressed={filters.platforms.includes(p.label)} onClick={() => set({ platforms: toggle(filters.platforms, p.label) })}>
            {p.label}
          </Chip>
        ))}
      </Row>
      <Row label="Gatunek">
        {GENRES.map((g) => (
          <Chip key={g.label} pressed={filters.genres.includes(g.label)} onClick={() => set({ genres: toggle(filters.genres, g.label) })}>
            {g.label}
          </Chip>
        ))}
      </Row>
      <Row label="Premiera">
        <SegmentedControl
          label="Okres premiery"
          items={PERIODS.map((p) => p.label)}
          value={PERIODS.find((p) => p.value === filters.period)?.label ?? PERIODS[0].label}
          onChange={(label) => set({ period: PERIODS.find((p) => p.label === label)?.value ?? "any" })}
        />
      </Row>
      <Row label="Ocena">
        <SegmentedControl
          label="Minimalna ocena"
          items={SCORES.map((s) => s.label)}
          value={SCORES.find((s) => s.value === filters.minScore)?.label ?? SCORES[0].label}
          onChange={(label) => set({ minScore: SCORES.find((s) => s.label === label)?.value ?? 0 })}
        />
      </Row>
      <Row label="Sortuj">
        <SelectField aria-label="Sortuj" value={filters.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
        <span className="ml-3 inline-flex items-center gap-2.5 text-[13px] leading-[18px] font-medium">
          <Switch label="Ukryj gry z moich list" checked={filters.hideListed} onChange={(hideListed) => set({ hideListed })} />
          Ukryj gry z moich list
        </span>
      </Row>
    </div>
  );
}
