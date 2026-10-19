import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_QUERY_LENGTH = 200;

const model = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_QUERY_LENGTH) : "";
  if (!text) return new Response("Invalid text", { status: 400, headers: CORS });

  const vector = await model.run(text, { mean_pool: true, normalize: true });
  return new Response(JSON.stringify({ vector: Array.from(vector as number[]) }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
