type Named = { id: number; name: string };

export type IgdbDetailFields = {
  age_ratings?: { organization?: { name: string }; rating_category?: { rating: string }; rating_content_descriptions?: { description: string }[] }[];
  release_dates?: { date?: number; platform?: { abbreviation?: string }; release_region?: { region: string }; status?: { name: string } }[];
  multiplayer_modes?: {
    platform?: { abbreviation?: string };
    onlinecoopmax?: number;
    onlinemax?: number;
    offlinecoopmax?: number;
    offlinemax?: number;
    splitscreen?: boolean;
    campaigncoop?: boolean;
    lancoop?: boolean;
    dropin?: boolean;
  }[];
  language_supports?: { language?: { name: string }; language_support_type?: { name: string } }[];
  websites?: { url: string; type?: { type: string } }[];
  external_games?: { uid: string; external_game_source?: { name: string } }[];
  involved_companies?: { company?: { name: string }; developer?: boolean; publisher?: boolean }[];
  game_modes?: { name: string }[];
  player_perspectives?: { name: string }[];
  game_type?: { type: string };
  dlcs?: Named[];
  expansions?: Named[];
  standalone_expansions?: Named[];
  remakes?: Named[];
  remasters?: Named[];
  ports?: Named[];
  bundles?: Named[];
  parent_game?: Named;
  version_parent?: Named;
  franchises?: { name: string }[];
  collections?: { name: string }[];
};

export const DETAIL_FIELDS = [
  "age_ratings.organization.name",
  "age_ratings.rating_category.rating",
  "age_ratings.rating_content_descriptions.description",
  "release_dates.date",
  "release_dates.platform.abbreviation",
  "release_dates.release_region.region",
  "release_dates.status.name",
  "multiplayer_modes.platform.abbreviation",
  "multiplayer_modes.onlinecoopmax",
  "multiplayer_modes.onlinemax",
  "multiplayer_modes.offlinecoopmax",
  "multiplayer_modes.offlinemax",
  "multiplayer_modes.splitscreen",
  "multiplayer_modes.campaigncoop",
  "multiplayer_modes.lancoop",
  "multiplayer_modes.dropin",
  "language_supports.language.name",
  "language_supports.language_support_type.name",
  "websites.url",
  "websites.type.type",
  "external_games.uid",
  "external_games.external_game_source.name",
  "involved_companies.company.name",
  "involved_companies.developer",
  "involved_companies.publisher",
  "game_modes.name",
  "player_perspectives.name",
  "game_type.type",
  "dlcs.name",
  "expansions.name",
  "standalone_expansions.name",
  "remakes.name",
  "remasters.name",
  "ports.name",
  "bundles.name",
  "parent_game.name",
  "version_parent.name",
  "franchises.name",
  "collections.name",
].join(",");

export type TimeToBeat = { hastily: number | null; normally: number | null; completely: number | null; count: number };

const related = (items?: Named[]) => items?.map(({ id, name }) => ({ id, name })) ?? [];
const single = (item?: Named) => (item ? { id: item.id, name: item.name } : null);

function languages(supports: IgdbDetailFields["language_supports"]) {
  const byName = new Map<string, { name: string; audio: boolean; subtitles: boolean; interface: boolean }>();
  for (const support of supports ?? []) {
    const name = support.language?.name;
    if (!name) continue;
    const entry = byName.get(name) ?? { name, audio: false, subtitles: false, interface: false };
    const type = support.language_support_type?.name;
    if (type === "Audio") entry.audio = true;
    if (type === "Subtitles") entry.subtitles = true;
    if (type === "Interface") entry.interface = true;
    byName.set(name, entry);
  }
  return [...byName.values()];
}

export const toDetails = (game: IgdbDetailFields, timeToBeat: TimeToBeat | null) => ({
  ageRatings: (game.age_ratings ?? []).map((a) => ({
    organization: a.organization?.name ?? null,
    rating: a.rating_category?.rating ?? null,
    descriptors: a.rating_content_descriptions?.map((d) => d.description) ?? [],
  })),
  releases: (game.release_dates ?? []).map((r) => ({
    platform: r.platform?.abbreviation ?? null,
    date: r.date ? r.date * 1000 : null,
    region: r.release_region?.region ?? null,
    status: r.status?.name ?? null,
  })),
  multiplayer: (game.multiplayer_modes ?? []).map((m) => ({
    platform: m.platform?.abbreviation ?? null,
    onlineMax: m.onlinemax ?? 0,
    onlineCoopMax: m.onlinecoopmax ?? 0,
    offlineMax: m.offlinemax ?? 0,
    offlineCoopMax: m.offlinecoopmax ?? 0,
    splitscreen: Boolean(m.splitscreen),
    campaignCoop: Boolean(m.campaigncoop),
    lanCoop: Boolean(m.lancoop),
    dropIn: Boolean(m.dropin),
  })),
  languages: languages(game.language_supports),
  websites: (game.websites ?? []).map((w) => ({ type: w.type?.type ?? "Inne", url: w.url })),
  steamId: game.external_games?.find((g) => g.external_game_source?.name === "Steam")?.uid ?? null,
  developers: (game.involved_companies ?? []).filter((c) => c.developer && c.company).map((c) => c.company!.name),
  publishers: (game.involved_companies ?? []).filter((c) => c.publisher && c.company).map((c) => c.company!.name),
  modes: game.game_modes?.map((m) => m.name) ?? [],
  perspectives: game.player_perspectives?.map((p) => p.name) ?? [],
  gameType: game.game_type?.type ?? null,
  related: {
    dlcs: related(game.dlcs),
    expansions: related(game.expansions),
    standaloneExpansions: related(game.standalone_expansions),
    remakes: related(game.remakes),
    remasters: related(game.remasters),
    ports: related(game.ports),
    bundles: related(game.bundles),
    parent: single(game.parent_game),
    versionParent: single(game.version_parent),
    franchises: game.franchises?.map((f) => f.name) ?? [],
    collections: game.collections?.map((c) => c.name) ?? [],
  },
  timeToBeat,
});
