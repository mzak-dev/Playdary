# AI chat

## Flow

- Client: `apps/web/src/lib/ai-chat.ts` posts `{ messages, mode }` to `/functions/v1/ai-chat` with the user JWT and reads SSE.
- Edge Function `ai-chat`: checks the daily quota (`ai_consume`), picks models from the chain skipping cooldowns (`ai_model_health`), runs the tool loop, streams events.
- Tools are fixed RPCs called with the user JWT (RLS applies): `ai_search_games`, `ai_upcoming_releases`, `ai_similar_games`, `ai_my_lists`. The model never writes SQL. Game cards come from tool results, not from model text.

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
