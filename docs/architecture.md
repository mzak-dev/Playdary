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
| `packages/design-system` | Web UI components (Tailwind v4, Radix) |
| `packages/tokens` | Design tokens in TS; generates `theme.css` (web) and `theme.native.css` (native) |
| `packages/core` | Platform-free data layer: Supabase client factory, React Query hooks, types, filters, `DB` types |
| `apps/native` | Expo app for iOS and Android (see `native.md`) |

## Deployment

- `deploy-web.yml` builds `apps/web` with `VITE_BASE=/<repo>/` and publishes to Pages.
- `deploy-backend.yml` runs `supabase db push` and `supabase functions deploy`.
- Repository variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PROJECT_ID`. Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`.
- Enable Pages with source "GitHub Actions" in repository settings.
- Add `https://<user>.github.io/<repo>/` to Supabase Auth redirect URLs.

## Auth

- E-mail and password through Supabase Auth; the username is sent as signup metadata and the `handle_new_user` trigger copies it into `profiles`.
- Routes: `/login` redirects signed-in users to `/`; `/` requires a session via `beforeLoad`.
- Supabase dashboard, Authentication, URL Configuration: Site URL `https://mzak-dev.github.io/Playdary/`, redirect URLs also `http://localhost:5173/**`.
- "Confirm email" is on by default: a new account must click the mailed link before signing in. The built-in mailer is rate-limited (a few mails per hour); switch to custom SMTP or disable confirmation for development.
- Local variables live in `apps/web/.env.local` (gitignored).

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
