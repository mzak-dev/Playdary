# Native app (Expo)

`apps/native` is the iOS and Android client. It shares the Supabase backend with `apps/web` and will share tokens and data code through `packages/*`.

## Run

- `pnpm install`, then `pnpm --filter @playdary/native start` and scan the QR code with the camera to open it in Expo Go.
- Phone and computer on one network, or add `--tunnel`.
- Expo Go only runs the SDK it ships with (SDK 58 now). Native modules outside Expo Go (MMKV) need a dev client, so storage goes through an adapter and starts on AsyncStorage.

## Decisions

- Expo managed with Expo Router; EAS for builds later.
- NativeWind v5 (Tailwind v4) so native uses the same CSS-first `@theme` as web. v4 stays the fallback; it needs Tailwind v3 and cannot share CSS with web.
- Components live in `packages/design-system-native`, mirroring the web component names, props and `cva` variants.
- Tokens come from one source in `packages/tokens`; web and native both consume the generated `theme.css`.
- Query embeddings always go through the `embed-query` Edge Function on native.
- AI chat is out of the first release.

## Spike findings (SDK 58, NativeWind 5.0.0-rc.0)

- `expo export` bundles iOS and Android in the pnpm monorepo with isolated installs; no `node-linker=hoisted` and no manual Metro `watchFolders` are needed.
- `lightningcss` must be pinned to `1.30.1` as a direct dependency of `apps/native`. Newer versions fail in the `react-native-css` compiler with `failed to deserialize`. The pin is local to the app, so web keeps its own lightningcss.
- `nativewind-env.d.ts` is created by hand (`expo start` normally writes it) and declares `*.css` for the `global.css` import.
- `tsc` passes with the root TypeScript 7.
- SDK 58 pins `react 19.3.0` and `react-native 0.88.0`, and React Native needs the exact renderer match. The whole repo therefore uses `react 19.3.0` (web was on 19.3.1) and shared packages declare `react` as a peer dependency.
- Tailwind only scans the app folder, so `global.css` has `@source "../../packages/design-system-native/src"`. Without it, classes used only inside the package (button background, input border) are silently missing.
- Not verified in the build environment: running in Expo Go on a device. Do this first on a phone.

## Fonts

React Native has no variable-weight fonts. Each weight is its own family (`Sora_700Bold`, `DMSans_400Regular`), so `font-display` maps to one weight and other weights need their own theme entries.

## Shared code

- `packages/core` has no DOM types (`lib: ES2023`), so the compiler rejects browser-only code. Hooks read the Supabase client and the embedder from `PlaydaryProvider`; each app builds them for its platform.
- `KeyValueStorage` is synchronous (localStorage, MMKV, `expo-sqlite/kv-store`). AsyncStorage is async, so native hydrates a cache before first render.
- `Embedder` is chosen per app: web switches between the Web Worker and `createServerEmbedder`, native uses only the server one.
- React, `react-dom` and `@tanstack/react-query` come from the `catalog:` in `pnpm-workspace.yaml`, so the whole repo resolves one copy; two copies break React context in Metro.
- Database types live in `packages/core/src/database.types.ts`; refresh with `pnpm --filter @playdary/backend db:types` (needs `supabase link`). Function return types are generated as non-null, so check nullable columns by hand.
- Tokens: edit `packages/tokens/src/index.ts`, then `pnpm --filter @playdary/tokens build` rewrites both CSS files (committed, so dev servers need no build step).

## Auth setup

- Copy `apps/native/.env.example` to `apps/native/.env` and fill in the Supabase URL and anon key (same values as web).
- Add these to Supabase Authentication, URL Configuration, Redirect URLs: `playdary://**` for builds and `exp://**` for Expo Go.
- E-mail and password work in Expo Go. Google and Discord open the system browser and return through the redirect URL; test them in a dev client.
- The session is stored in AsyncStorage and refreshed while the app is in the foreground. Sign-out clears the persisted query cache.

## Browser preview

`pnpm --filter @playdary/native web` runs the app in a browser through `react-native-web`, with your `.env`. It checks layout, colours, fonts and flow, not React Native's own style engine, so confirm on a phone too. `Appearance.setColorScheme` is missing there, so the theme switch only works on a device.

## Screens

- Onboarding: five swipeable slides (search, rate, lists, friends, AI assistant), shown once; the flag lives in `playdary:onboarded`.
- Tabs: Start, Szukaj, Listy, Znajomi, Profil. Outside the tabs: `games/[gameId]` and `u/[username]`.
- Not built yet: the AI chat itself. Slide five only announces it.
- Trailers use `react-native-youtube-iframe` on devices and a plain iframe in the browser preview.
- Set `EXPO_PUBLIC_WEB_URL` to the web app address so invite links open there; without it they use the app's deep link.
