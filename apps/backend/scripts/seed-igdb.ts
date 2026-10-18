import { pipeline } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";

const env = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
};

const TARGET = Number(process.env.SEED_LIMIT ?? 20_000);
const PAGE_SIZE = 500;
const IGDB_DELAY_MS = 260;
const EMBED_BATCH = 16;

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type IgdbGame = {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  cover?: { image_id: string };
  screenshots?: { image_id: string }[];
  videos?: { video_id: string }[];
  genres?: { name: string }[];
  themes?: { name: string }[];
  platforms?: { abbreviation?: string; name?: string }[];
  first_release_date?: number;
  total_rating?: number;
  follows?: number;
  hypes?: number;
};

async function twitchToken() {
  const params = new URLSearchParams({
    client_id: env("TWITCH_CLIENT_ID"),
    client_secret: env("TWITCH_CLIENT_SECRET"),
    grant_type: "client_credentials",
  });
  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST" });
  if (!response.ok) throw new Error(`Twitch auth failed: ${response.status}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function fetchPage(token: string, offset: number) {
  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: { "Client-ID": env("TWITCH_CLIENT_ID"), Authorization: `Bearer ${token}` },
    body: `fields name,summary,storyline,cover.image_id,screenshots.image_id,videos.video_id,genres.name,themes.name,platforms.abbreviation,platforms.name,first_release_date,total_rating,follows,hypes;
      where cover != null & total_rating_count > 0;
      sort total_rating_count desc;
      limit ${PAGE_SIZE}; offset ${offset};`,
  });
  if (!response.ok) throw new Error(`IGDB failed: ${response.status} ${await response.text()}`);
  return (await response.json()) as IgdbGame[];
}

const toRow = (game: IgdbGame) => ({
  id: game.id,
  name: game.name,
  data: {
    summary: game.summary ?? null,
    storyline: game.storyline ?? null,
    cover: game.cover?.image_id ?? null,
    screenshots: game.screenshots?.map((s) => s.image_id) ?? [],
    videos: game.videos?.map((v) => v.video_id) ?? [],
    genres: game.genres?.map((g) => g.name) ?? [],
    themes: game.themes?.map((t) => t.name) ?? [],
    platforms: game.platforms?.map((p) => p.abbreviation ?? p.name) ?? [],
    releaseDate: game.first_release_date ? game.first_release_date * 1000 : null,
    score: game.total_rating ?? null,
    follows: game.follows ?? 0,
    hypes: game.hypes ?? 0,
  },
});

async function seedGames() {
  const token = await twitchToken();
  for (let offset = 0; offset < TARGET; offset += PAGE_SIZE) {
    const games = await fetchPage(token, offset);
    if (games.length === 0) break;
    const { error } = await supabase.from("games").upsert(games.map(toRow));
    if (error) throw error;
    console.log(`games upserted: ${offset + games.length}`);
    await sleep(IGDB_DELAY_MS);
  }
}

type StoredGame = { id: number; name: string; data: { summary: string | null; genres: string[]; themes: string[] } };

const embeddingText = ({ name, data }: StoredGame) =>
  [name, data.summary, data.genres.join(", "), data.themes.join(", ")].filter(Boolean).join(". ").slice(0, 1500);

async function embedMissing() {
  const extractor = await pipeline("feature-extraction", "Supabase/gte-small");
  let done = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("games")
      .select("id, name, data")
      .is("embedding", null)
      .order("id")
      .limit(EMBED_BATCH);
    if (error) throw error;
    if (!data?.length) break;

    const batch = data as StoredGame[];
    const output = await extractor(batch.map(embeddingText), { pooling: "mean", normalize: true });
    const vectors = output.tolist() as number[][];
    const rows = batch.map((game, i) => ({ ...game, embedding: JSON.stringify(vectors[i]) }));
    const { error: updateError } = await supabase.from("games").upsert(rows);
    if (updateError) throw updateError;
    done += batch.length;
    console.log(`embedded: ${done}`);
  }
}

await seedGames();
await embedMissing();
console.log("seed finished");
