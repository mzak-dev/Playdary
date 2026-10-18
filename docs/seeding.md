# Seeding games from IGDB

The seed script fills `games` with the most-rated IGDB titles and computes `gte-small` embeddings locally, so Edge Function limits do not apply.

## Setup

1. Create a Twitch application at https://dev.twitch.tv/console and copy Client ID and Client Secret.
2. Copy the `service_role` key from Supabase: Project Settings, API. It bypasses RLS, so it stays only in the local file.
3. `cp apps/backend/.env.example apps/backend/.env` and fill the values (`.env` is gitignored).

## Run

```bash
pnpm --filter @playdary/backend seed
```

- Phase 1 pages through IGDB (500 per request, ~4 req/s) and upserts games without touching existing embeddings.
- Phase 2 embeds every game where `embedding is null`, in batches of 16. The first run downloads the model (~30 MB).
- The script is resumable: rerunning only embeds what is still missing. `SEED_LIMIT` caps the number of games (default 20000); use a small value like 200 for a smoke test.

## Notes

- Ordering is by `total_rating_count`, which approximates popularity; IGDB also exposes a popularity endpoint if a better ranking is needed.
- Embedding text is name, summary, genres and themes. The query side must use the same model (`Supabase/gte-small`).
- Verify IGDB terms of use before redistributing cached data publicly.
