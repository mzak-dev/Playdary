import {
  AGE_ORGANIZATIONS,
  AGE_RATINGS,
  REGIONS,
  RELEASE_STATUSES,
  ageDescriptor,
  useExistingGameIds,
  useRequirements,
  type Details,
} from "@playdary/core";
import { GameCover, Skeleton, StatTile, Tag, useTokenColor } from "@playdary/design-system-native";
import { ArrowUpRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { cn } from "@playdary/design-system-native";

export const SectionTitle = ({ children, large }: { children: ReactNode; large?: boolean }) => (
  <Text accessibilityRole="header" className={large ? "font-display text-2xl leading-[30px] tracking-tight text-foreground" : "font-display text-xl leading-[26px] text-foreground"}>
    {children}
  </Text>
);

export const Label = ({ children }: { children: string }) => <Text className="font-sans-semibold text-[13px] leading-4 tracking-[0.3px] text-muted-foreground">{children}</Text>;

const Note = ({ children }: { children: ReactNode }) => <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{children}</Text>;

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
    <View className="gap-2">
      <Label>Czas przejścia</Label>
      <View className="flex-row gap-2">
        <StatTile value={duration(data.hastily)} label="Szybko" />
        <StatTile value={duration(data.normally)} label="Normalnie" />
        <StatTile value={duration(data.completely)} label="Na 100%" />
      </View>
    </View>
  );
}

export function AgeRatings({ items }: { items: Details["ageRatings"] }) {
  return (
    <View className="gap-4">
      <SectionTitle>Klasyfikacja wiekowa</SectionTitle>
      {items.length === 0 ? (
        <Note>Brak klasyfikacji wiekowej w IGDB.</Note>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {items.map((item, i) => (
            <View key={i} className="min-w-[110px] flex-1 gap-0.5 rounded-md bg-secondary p-4">
              <Text className="font-sans-semibold text-xs leading-4 text-muted-foreground">{AGE_ORGANIZATIONS[item.organization ?? ""] ?? item.organization}</Text>
              <Text className="font-display text-xl leading-[26px] text-foreground">{AGE_RATINGS[item.rating ?? ""] ?? item.rating}</Text>
              {item.descriptors.length > 0 && <Text className="font-sans text-xs leading-4 text-muted-foreground">{[...new Set(item.descriptors.map(ageDescriptor))].join(", ")}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function Releases({ items }: { items: Details["releases"] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => (a.date ?? Infinity) - (b.date ?? Infinity));
  return (
    <View className="gap-4">
      <SectionTitle>Premiery</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        {sorted.map((item, i) => {
          const released = item.date !== null && item.date <= Date.now();
          return (
            <View key={i} className="min-w-[150px] flex-1 items-start gap-1 rounded-md bg-secondary p-4">
              <Tag>{item.platform ?? "?"}</Tag>
              <Text className="mt-1 font-sans-semibold text-[15px] leading-[22px] text-foreground">{formatDate(item.date)}</Text>
              <Text className={cn("font-sans-bold text-xs leading-4", released ? "text-success" : "text-muted-foreground")}>{RELEASE_STATUSES[item.status ?? ""] ?? item.status ?? "–"}</Text>
              <Text className="font-sans text-xs leading-4 text-muted-foreground">{REGIONS[item.region ?? ""] ?? item.region ?? "–"}</Text>
            </View>
          );
        })}
      </View>
    </View>
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
    <View className="gap-4">
      <SectionTitle>Wieloosobowa</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        {features.map((feature) => (
          <View key={feature.label} className={cn("min-w-[130px] flex-1 gap-0.5 rounded-lg px-4 py-3.5", feature.on ? "bg-primary" : "border border-dashed border-border bg-card")}>
            <Text className={cn("font-display-extrabold text-[26px] leading-8", feature.on ? "text-primary-foreground" : "text-muted-foreground")}>{feature.on ? feature.big : "–"}</Text>
            <Text className={cn("font-sans-semibold text-[13px] leading-[18px]", feature.on ? "text-primary-foreground" : "text-muted-foreground")}>{feature.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Languages({ items }: { items: Details["languages"] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => (b.name === "Polish" ? 1 : 0) - (a.name === "Polish" ? 1 : 0) || Number(b.audio) - Number(a.audio));
  const pill = (on: boolean, label: string) => (
    <View className={cn("rounded-full bg-accent px-2 py-0.5", !on && "opacity-55")}>
      <Text className={cn("font-sans-semibold text-[11px] leading-4", on ? "text-foreground" : "text-muted-foreground")}>{label}</Text>
    </View>
  );
  return (
    <View className="gap-4">
      <SectionTitle>Języki</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        {sorted.map((language) => (
          <View key={language.name} className="min-w-[160px] flex-1 gap-2 rounded-md bg-secondary p-3.5">
            <Text className="font-sans-semibold text-[15px] leading-[22px] text-foreground">{language.name}</Text>
            <View className="flex-row flex-wrap gap-1">
              {pill(language.audio, "Dubbing")}
              {pill(language.subtitles, "Napisy")}
              {pill(language.interface, "Interfejs")}
            </View>
          </View>
        ))}
      </View>
    </View>
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
  const color = useTokenColor("foreground");
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)} className="flex-row items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 active:opacity-80">
      <Text className="font-sans-semibold text-sm leading-5 text-foreground">{label}</Text>
      <ArrowUpRight color={color} size={14} />
    </Pressable>
  );
}

export function Links({ items }: { items: Details["websites"] }) {
  const valid = items.filter((item) => isHttp(item.url));
  const stores = valid.filter((item) => item.type in STORES);
  const links = valid.filter((item) => item.type in LINK_LABELS);
  if (stores.length === 0 && links.length === 0) return null;
  return (
    <View className="gap-3">
      {stores.length > 0 && (
        <>
          <SectionTitle>Gdzie kupić</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {stores.map((item) => (
              <LinkChip key={item.url} label={STORES[item.type] ?? item.type} url={item.url} />
            ))}
          </View>
        </>
      )}
      {links.length > 0 && (
        <>
          <Label>Strony i społeczność</Label>
          <View className="flex-row flex-wrap gap-2">
            {links.map((item) => (
              <LinkChip key={item.url} label={LINK_LABELS[item.type] ?? item.type} url={item.url} />
            ))}
          </View>
        </>
      )}
      <Note>Linki pochodzą z pól websites w IGDB.</Note>
    </View>
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
    <View className="gap-3">
      <Text accessibilityRole="header" className="font-display text-xl leading-[26px] text-foreground">
        Wymagania PC <Text className="font-sans-medium text-[13px] leading-[18px] text-muted-foreground">· dane ze Steam</Text>
      </Text>
      {!data ? (
        <View className="gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </View>
      ) : (
        <View className="gap-2">
          {(["Minimalne", "Zalecane"] as const).map((title, column) => (
            <View key={title} className="gap-2">
              <Text className="font-sans-bold text-xs leading-4 tracking-wider text-muted-foreground uppercase">{title}</Text>
              {keys.map((key) => (
                <View key={`${key}-${column}`} className="gap-0.5 rounded-md bg-secondary px-3.5 py-2.5">
                  <Text className="font-sans-semibold text-xs leading-4 text-muted-foreground">{REQUIREMENT_LABELS[key] ?? key}</Text>
                  <Text className="font-sans-medium text-sm leading-5 text-foreground">{value(column === 0 ? data.minimum : data.recommended, key)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
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
    <View className="gap-4">
      <SectionTitle large>Powiązane</SectionTitle>
      {series.length > 0 && (
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="mr-1 font-sans-semibold text-[13px] leading-4 text-muted-foreground">Seria</Text>
          {series.map((name) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </View>
      )}
      {shown.length === 0 && <Note>Brak powiązanych gier w IGDB.</Note>}
      <View className="gap-5">
        {shown.map((group) => (
          <View key={group.label} className="gap-2">
            <Label>{group.label}</Label>
            <View className="gap-1">
              {group.items.map((item) => {
                const linked = existing?.has(item.id) ?? false;
                return (
                  <Pressable key={item.id} accessibilityRole="button" disabled={!linked} onPress={() => onOpen(item.id)} className={cn("flex-row items-center gap-3 rounded-lg px-3 py-2 active:bg-card", !linked && "opacity-60")}>
                    <GameCover thumb title={item.name} cover={null} className="h-10 w-14" />
                    <Text className="min-w-0 flex-1 font-sans-semibold text-sm leading-5 text-foreground">{item.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            {group.hidden > 0 && <Note>i jeszcze {group.hidden} w IGDB</Note>}
          </View>
        ))}
      </View>
    </View>
  );
}
