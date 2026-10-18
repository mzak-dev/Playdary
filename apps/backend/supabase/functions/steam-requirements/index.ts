import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const strip = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const parse = (html?: string) =>
  [...(html ?? "").matchAll(/<li><strong>(.*?)<\/strong>(.*?)<\/li>/gis)]
    .map(([, key, value]) => ({ key: strip(key).replace(/[:*\s]+$/, ""), value: strip(value) }))
    .filter((row) => row.value);

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const body = await req.json().catch(() => ({}));
  const appId = String(body.appId ?? new URL(req.url).searchParams.get("appId") ?? "");
  if (!/^\d{1,10}$/.test(appId)) return new Response("Invalid appId", { status: 400, headers: CORS });

  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`);
  if (!response.ok) return new Response("Steam unavailable", { status: 502, headers: CORS });

  const entry = (await response.json())[appId];
  const requirements = entry?.success ? entry.data?.pc_requirements : null;
  return json({ minimum: parse(requirements?.minimum), recommended: parse(requirements?.recommended) });
});
