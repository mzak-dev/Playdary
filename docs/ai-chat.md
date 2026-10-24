# AI chat

## Flow

- Client state lives in `packages/core/src/ai-chat.ts` (`useAiChat` with an injected transport). Web transport: `apps/web/src/lib/ai-chat.ts`, native: `apps/native/lib/ai-transport.ts`. Each posts `{ messages, mode }` to `/functions/v1/ai-chat` with the user JWT and reads SSE.
- Edge Function `ai-chat`: checks the daily quota (`ai_consume`), picks models from the chain skipping cooldowns (`ai_model_health`), runs the tool loop, streams events.
- Tools are fixed RPCs called with the user JWT (RLS applies): `ai_search_games`, `ai_upcoming_releases`, `ai_similar_games`, `ai_my_lists`. The model never writes SQL. Game cards come from tool results, not from model text.

## Native client

- Transport uses `expo/fetch`, because React Native's global `fetch` does not stream the response body. Same request and SSE parsing as web.
- `ChatProvider` sits above the navigator, so the conversation survives opening a game from a card and coming back.
- History is stored in AsyncStorage under `playdary:ai-chat:<userId>` (last 40 messages). An answer that was still streaming when the app closed is restored as interrupted. Sign-out clears the stored history.
- Long-press on an answer copies its markdown to the clipboard. The game page opens the chat with a ready question about that game.
- Markdown is rendered by `@ronradtke/react-native-markdown-display` (the original package has not been published since 2023). Only `http`, `https` and `mailto` links open.

## SSE events

`model` (label, fallback), `delta` (text), `tool` (name, running|done, count), `cards`, `done` (model, ms), `error` (interrupted|unavailable).
Before the stream: HTTP 429 `{error:"limit"}` when the daily quota is spent, 503 `{error:"unavailable"}` when every model is on cooldown. Header `x-ai-remaining` carries the remaining questions.

## Secrets

`supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=... OPENROUTER_API_KEY=... AI_DAILY_LIMIT=30`
Optional `AI_CHAIN`: JSON array of `{ id, provider, label, tools }` replacing `DEFAULT_CHAIN` in `config.ts`.

## Unverified assumptions

- Model IDs in `DEFAULT_CHAIN` (including `*-latest` aliases and `openrouter/free`) must be checked against AI Studio, Groq and OpenRouter `/models`.
- Streamed `tool_calls` from Gemini may lack `index`; `ToolCallAccumulator` groups by `id` (unit tested, not yet run against the live API).
- Edge Function wall-clock limit vs `PROVIDER_TIMEOUT_MS` and `MAX_TOOL_ROUNDS`.
- A model failing after it sent text ends the stream with `error: interrupted`; there is no mid-stream model switch.
- Retrieved IGDB text is untrusted: tools are read-only and the system prompt tells the model to treat results as data.
