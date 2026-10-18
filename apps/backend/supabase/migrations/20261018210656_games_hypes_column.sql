alter table public.games drop column follows;
alter table public.games add column hypes integer generated always as (coalesce((data ->> 'hypes')::integer, 0)) stored;
create index games_hypes_idx on public.games (hypes desc);
