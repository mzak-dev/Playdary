alter table public.games add column rating_count integer;
create index games_rating_count_idx on public.games (rating_count desc nulls last);

create function public.browse_games(
  p_tab text default 'popular',
  p_platforms text[] default '{}',
  p_genres text[] default '{}',
  p_themes text[] default '{}',
  p_period text default 'any',
  p_min_score integer default 0,
  p_sort text default 'default',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id bigint, name text, hypes integer, score real, release_date bigint,
  cover text, genres text[], themes text[], platforms text[], total bigint
)
language sql stable set search_path = public as $$
  with clock as (select (extract(epoch from now()) * 1000)::bigint as now_ms)
  select
    g.id, g.name, g.hypes, g.score, g.release_date,
    g.data ->> 'cover',
    array(select jsonb_array_elements_text(g.data -> 'genres')),
    array(select jsonb_array_elements_text(g.data -> 'themes')),
    array(select jsonb_array_elements_text(g.data -> 'platforms')),
    count(*) over ()
  from public.games g
  cross join clock c
  where (p_tab <> 'upcoming' or g.release_date > c.now_ms)
    and (p_tab <> 'new' or g.release_date <= c.now_ms)
    and (p_tab <> 'classics' or g.release_date < 1451606400000)
    and (p_tab <> 'best' or (g.score is not null and g.rating_count >= 50))
    and (cardinality(p_platforms) = 0 or g.data -> 'platforms' ?| p_platforms)
    and ((cardinality(p_genres) = 0 and cardinality(p_themes) = 0)
         or g.data -> 'genres' ?| p_genres or g.data -> 'themes' ?| p_themes)
    and (p_period = 'any'
         or (p_period = '12m' and g.release_date <= c.now_ms and g.release_date > c.now_ms - 31536000000)
         or (p_period = 'year' and extract(year from to_timestamp(g.release_date / 1000.0)) = extract(year from now()))
         or (p_period = 'older' and g.release_date < c.now_ms - 31536000000))
    and (p_min_score = 0 or g.score >= p_min_score)
  order by
    case when p_sort = 'popularity' or (p_sort = 'default' and p_tab in ('popular', 'classics')) then g.rating_count end desc nulls last,
    case when p_sort = 'hype' then g.hypes end desc nulls last,
    case when p_sort = 'score' or (p_sort = 'default' and p_tab = 'best') then g.score end desc nulls last,
    case when p_sort = 'date' or (p_sort = 'default' and p_tab = 'upcoming') then g.release_date end asc nulls last,
    case when p_sort = 'default' and p_tab = 'new' then g.release_date end desc nulls last,
    case when p_sort = 'alpha' then g.name end asc,
    g.id
  limit p_limit offset p_offset;
$$;

revoke execute on function public.browse_games(text, text[], text[], text[], text, integer, text, integer, integer) from public, anon;
grant execute on function public.browse_games(text, text[], text[], text[], text, integer, text, integer, integer) to authenticated;
