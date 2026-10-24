import { GameCover, Skeleton, StatTile, Tag } from "@playdary/design-system";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useExistingGameIds, useRequirements, type Details, AGE_ORGANIZATIONS, AGE_RATINGS, REGIONS, RELEASE_STATUSES, ageDescriptor } from "@playdary/core";

export const SectionTitle = ({ children, large }: { children: ReactNode; large?: boolean }) => (
  <h2 className={large ? "font-display text-[28px] leading-[34px] font-bold tracking-tight" : "font-display text-xl leading-[26px] font-bold"}>{children}</h2>
);

const Note = ({ children }: { children: ReactNode }) => <p className="text-[13px] leading-[18px] text-muted-foreground">{children}</p>;

const formatDate = (timestamp: number | null) =>
  timestamp ? new Date(timestamp).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }) : "TBA";

const duration = (seconds: number | null) => {
  if (!seconds) return "–";
  const hours = seconds / 3600;
  return hours < 1 ? `${Math.round(seconds / 60)} min` : `${hours < 10 ? hours.toFixed(1).replace(".", ",") : Math.round(hours)} godz.`;
};

export function TimeToBeat({ data }: { data: Details["timeToBeat"] }) {
  if (!data || data.count === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] leading-4 font-semibold tracking-[0.02em] text-muted-foreground">Czas przejścia</span>
      <div className="flex flex-wrap gap-2">
        <StatTile value={duration(data.hastily)} label="Szybko" />
        <StatTile value={duration(data.normally)} label="Normalnie" />
        <StatTile value={duration(data.completely)} label="Na 100%" />
      </div>
    </div>
  );
}

export function AgeRatings({ items }: { items: Details["ageRatings"] }) {
  return (
    <section className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-4">
      <SectionTitle>Klasyfikacja wiekowa</SectionTitle>
      {items.length === 0 ? (
        <Note>Brak klasyfikacji wiekowej w IGDB.</Note>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex min-w-[110px] flex-1 flex-col gap-0.5 rounded-md bg-secondary p-4">
              <span className="text-xs leading-4 font-semibold text-muted-foreground">{AGE_ORGANIZATIONS[item.organization ?? ""] ?? item.organization}</span>
              <span className="font-display text-xl leading-[26px] font-bold">{AGE_RATINGS[item.rating ?? ""] ?? item.rating}</span>
              {item.descriptors.length > 0 && (
                <span className="text-xs leading-4 text-muted-foreground">{[...new Set(item.descriptors.map(ageDescriptor))].join(", ")}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Releases({ items }: { items: Details["releases"] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => (a.date ?? Infinity) - (b.date ?? Infinity));
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Premiery</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
        {sorted.map((item, i) => {
          const released = item.date !== null && item.date <= Date.now();
          return (
            <div key={i} className="flex flex-col items-start gap-1 rounded-md bg-secondary p-4">
              <Tag>{item.platform ?? "?"}</Tag>
              <span className="mt-1 text-[15px] leading-[22px] font-semibold">{formatDate(item.date)}</span>
              <span className={`text-xs leading-4 font-bold ${released ? "text-success" : "text-muted-foreground"}`}>
                {RELEASE_STATUSES[item.status ?? ""] ?? item.status ?? "–"}
              </span>
              <span className="text-xs leading-4 text-muted-foreground">{REGIONS[item.region ?? ""] ?? item.region ?? "–"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Multiplayer({ items }: { items: Details["multiplayer"] }) {
  if (items.length === 0) return null;
  const max = (pick: (m: Details["multiplayer"][number]) => number) => Math.max(...items.map(pick));
  const any = (pick: (m: Details["multiplayer"][number]) => boolean) => items.some(pick);
  const features: { label: string; big: string; on: boolean }[] = [
    { label: "Online", big: String(max((m) => m.onlineMax)), on: max((m) => m.onlineMax) > 0 },
    { label: "Online kooperacja", big: String(max((m) => m.onlineCoopMax)), on: max((m) => m.onlineCoopMax) > 0 },
    { label: "Lokalnie", big: String(max((m) => m.offlineMax)), on: max((m) => m.offlineMax) > 0 },
    { label: "Lokalna kooperacja", big: String(max((m) => m.offlineCoopMax)), on: max((m) => m.offlineCoopMax) > 0 },
    { label: "Podzielony ekran", big: "✓", on: any((m) => m.splitscreen) },
    { label: "Kooperacja w kampanii", big: "✓", on: any((m) => m.campaignCoop) },
    { label: "LAN", big: "✓", on: any((m) => m.lanCoop) },
    { label: "Dołączanie w trakcie", big: "✓", on: any((m) => m.dropIn) },
  ];
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Wieloosobowa</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
        {features.map((feature) => (
          <div
            key={feature.label}
            className={`flex flex-col gap-0.5 rounded-lg px-4 py-3.5 ${feature.on ? "bg-primary text-primary-foreground" : "border border-dashed border-border bg-card text-muted-foreground"}`}
          >
            <span className="font-display text-[26px] leading-8 font-extrabold">{feature.on ? feature.big : "–"}</span>
            <span className="text-[13px] leading-[18px] font-semibold">{feature.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Languages({ items }: { items: Details["languages"] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => (b.name === "Polish" ? 1 : 0) - (a.name === "Polish" ? 1 : 0) || Number(b.audio) - Number(a.audio));
  const pill = (on: boolean, label: string) => (
    <span className={`rounded-full bg-secondary px-2 py-0.5 text-[11px] leading-4 font-semibold ${on ? "text-foreground" : "text-muted-foreground opacity-55"}`}>{label}</span>
  );
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Języki</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
        {sorted.map((language) => (
          <div key={language.name} className="flex flex-col gap-2 rounded-md bg-secondary/60 p-3.5">
            <span className="text-[15px] leading-[22px] font-semibold">{language.name}</span>
            <span className="flex flex-wrap gap-1">
              {pill(language.audio, "Dubbing")}
              {pill(language.subtitles, "Napisy")}
              {pill(language.interface, "Interfejs")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

const STORES: Record<string, string> = {
  Steam: "Steam",
  GOG: "GOG",
  Epic: "Epic Games Store",
  Xbox: "Xbox",
  Playstation: "PlayStation Store",
  Nintendo: "Nintendo eShop",
  Itch: "itch.io",
  iPhone: "App Store (iPhone)",
  iPad: "App Store (iPad)",
  Android: "Google Play",
};

const LINK_LABELS: Record<string, string> = {
  "Official Website": "Strona oficjalna",
  "Community Wiki": "Wiki społeczności",
  Wikipedia: "Wikipedia",
  Subreddit: "Reddit",
  Twitter: "X (Twitter)",
  Facebook: "Facebook",
  Instagram: "Instagram",
  YouTube: "YouTube",
  Twitch: "Twitch",
  Discord: "Discord",
};

const isHttp = (url: string) => /^https?:\/\//i.test(url);

function LinkChip({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm leading-5 font-semibold transition hover:bg-accent active:scale-[0.97]"
    >
      {label}
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}

export function Links({ items }: { items: Details["websites"] }) {
  const valid = items.filter((item) => isHttp(item.url));
  const stores = valid.filter((item) => item.type in STORES);
  const links = valid.filter((item) => item.type in LINK_LABELS);
  if (stores.length === 0 && links.length === 0) return null;
  return (
    <section className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-3">
      {stores.length > 0 && (
        <>
          <SectionTitle>Gdzie kupić</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {stores.map((item) => (
              <LinkChip key={item.url} label={STORES[item.type] ?? item.type} url={item.url} />
            ))}
          </div>
        </>
      )}
      {links.length > 0 && (
        <>
          <span className="mt-2 text-[13px] leading-4 font-semibold tracking-[0.02em] text-muted-foreground">Strony i społeczność</span>
          <div className="flex flex-wrap gap-2">
            {links.map((item) => (
              <LinkChip key={item.url} label={LINK_LABELS[item.type] ?? item.type} url={item.url} />
            ))}
          </div>
        </>
      )}
      <Note>Linki pochodzą z pól websites w IGDB.</Note>
    </section>
  );
}

const REQUIREMENT_LABELS: Record<string, string> = {
  OS: "System",
  Processor: "Procesor",
  Memory: "Pamięć RAM",
  Graphics: "Karta graficzna",
  Storage: "Dysk",
  DirectX: "DirectX",
  Network: "Sieć",
  "Sound Card": "Karta dźwiękowa",
  "Additional Notes": "Uwagi",
};

export function PcRequirements({ steamId }: { steamId: string | null }) {
  const requirements = useRequirements(steamId);
  if (steamId === null || requirements.isError) return null;

  const data = requirements.data;
  if (data && data.minimum.length === 0 && data.recommended.length === 0) return null;
  const keys = data ? [...new Set([...data.minimum, ...data.recommended].map((row) => row.key))] : [];
  const value = (rows: { key: string; value: string }[], key: string) => rows.find((row) => row.key === key)?.value ?? "–";

  return (
    <section className="flex max-w-[640px] flex-[2_1_420px] flex-col gap-3">
      <h2 className="font-display text-xl leading-[26px] font-bold">
        Wymagania PC <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">· dane ze Steam</span>
      </h2>
      {!data ? (
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs leading-4 font-bold tracking-wider text-muted-foreground uppercase">Minimalne</div>
          <div className="text-xs leading-4 font-bold tracking-wider text-muted-foreground uppercase">Zalecane</div>
          {keys.flatMap((key) =>
            [data.minimum, data.recommended].map((rows, column) => (
              <div key={`${key}-${column}`} className="flex flex-col gap-0.5 rounded-md bg-secondary px-3.5 py-2.5">
                <span className="text-xs leading-4 font-semibold text-muted-foreground">{REQUIREMENT_LABELS[key] ?? key}</span>
                <span className="text-sm leading-5 font-medium">{value(rows, key)}</span>
              </div>
            )),
          )}
        </div>
      )}
    </section>
  );
}

type RelatedProps = { related: Details["related"]; onOpen: (id: number) => void };

export function Related({ related, onOpen }: RelatedProps) {
  const groups: { label: string; items: { id: number; name: string }[] }[] = [
    { label: "Gra podstawowa", items: [related.parent, related.versionParent].filter((item) => item !== null) },
    { label: "Dodatki", items: related.expansions },
    { label: "Samodzielne dodatki", items: related.standaloneExpansions },
    { label: "DLC", items: related.dlcs },
    { label: "Remake'i", items: related.remakes },
    { label: "Remastery", items: related.remasters },
    { label: "Porty", items: related.ports },
    { label: "Zestawy", items: related.bundles },
  ].filter((group) => group.items.length > 0);

  const shown = groups.map((group) => ({ ...group, hidden: Math.max(0, group.items.length - 8), items: group.items.slice(0, 8) }));
  const existing = useExistingGameIds(shown.flatMap((group) => group.items.map((item) => item.id))).data;
  const series = [...related.franchises, ...related.collections.filter((name) => !related.franchises.includes(name))];

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle large>Powiązane</SectionTitle>
      {series.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[13px] leading-4 font-semibold text-muted-foreground">Seria</span>
          {series.map((name) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </div>
      )}
      {shown.length === 0 && <Note>Brak powiązanych gier w IGDB.</Note>}
      <div className="flex flex-col gap-5">
        {shown.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <span className="text-[13px] leading-4 font-semibold tracking-[0.02em] text-muted-foreground">{group.label}</span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-1">
              {group.items.map((item) => {
                const linked = existing?.has(item.id) ?? false;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!linked}
                    onClick={() => onOpen(item.id)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors enabled:cursor-pointer enabled:hover:bg-card disabled:opacity-60"
                  >
                    <GameCover thumb title={item.name} cover={null} className="h-10 w-14" />
                    <span className="min-w-0 text-sm leading-5 font-semibold">{item.name}</span>
                  </button>
                );
              })}
            </div>
            {group.hidden > 0 && <Note>i jeszcze {group.hidden} w IGDB</Note>}
          </div>
        ))}
      </div>
    </section>
  );
}
