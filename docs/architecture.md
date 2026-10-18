# Architecture

## Stack decisions

- **Turborepo + pnpm**: three small packages, no generators needed; Nx adds config without payoff here.
- **Vite SPA + TanStack Router**: GitHub Pages serves static files only, so no SSR (Next.js is out). The app sits behind login, so SEO is irrelevant.
- **Supabase**: Auth, Postgres (pgvector, pg_trgm), Edge Functions, pg_cron. No self-hosted server.
- **Design system**: `packages/design-system`, shadcn-compatible tokens (see `design-system.md`).

## Layout

| Path | Role |
| --- | --- |
| `apps/web` | React SPA deployed to GitHub Pages |
| `apps/backend` | Supabase project: migrations, Edge Functions |
| `packages/design-system` | Tokens, Tailwind theme, UI components |

## Deployment

- `deploy-web.yml` builds `apps/web` with `VITE_BASE=/<repo>/` and publishes to Pages.
- `deploy-backend.yml` runs `supabase db push` and `supabase functions deploy`.
- Repository variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PROJECT_ID`. Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`.
- Enable Pages with source "GitHub Actions" in repository settings.
- Add `https://<user>.github.io/<repo>/` to Supabase Auth redirect URLs.

## Pages specifics

- Router `basepath` and Vite `base` come from `VITE_BASE`.
- The build copies `index.html` to `404.html` so deep links and refreshes work.
- Free Supabase projects pause after a week of inactivity.

## Security

- The anon key is public by design; RLS protects data.
- IGDB (Twitch) credentials live only in Edge Function secrets: `supabase secrets set TWITCH_CLIENT_ID=... TWITCH_CLIENT_SECRET=...`.

## Backend plan (from handoff)

1. Migrations: extensions (`vector`, `pg_trgm`, `pg_cron`, `pg_net`), tables, indexes, RLS, hybrid `search_games`, `friends_on_game`.
2. Local seed script: IGDB top ~20k games, gte-small embeddings, upsert.
3. Edge Functions: `igdb-lookup`, `sync-igdb`, `embed-game` plus queue and `pg_cron`.
4. Client data layer with Dexie: cache-first reads, Supabase is the source of truth, writes go to Supabase first.
5. Web Worker with Transformers.js for query embeddings.
