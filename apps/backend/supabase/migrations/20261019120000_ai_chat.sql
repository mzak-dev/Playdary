create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  count integer not null default 0,
  primary key (user_id, day)
);

create table public.ai_model_health (
  model_id text primary key,
  cooldown_until timestamptz not null,
  reason text,
  updated_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;
alter table public.ai_model_health enable row level security;

create function public.ai_consume(p_user uuid, p_limit integer)
returns integer
language plpgsql security definer set search_path = '' as $$
declare
  used integer;
begin
  insert into public.ai_usage as u (user_id, day, count)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = u.count + 1 where u.count < p_limit
  returning u.count into used;

  if used is null then return -1; end if;
  return p_limit - used;
end;
$$;

create function public.ai_refund(p_user uuid)
returns void
language sql security definer set search_path = '' as $$
  update public.ai_usage set count = greatest(count - 1, 0)
  where user_id = p_user and day = (now() at time zone 'utc')::date;
$$;

revoke execute on function public.ai_consume(uuid, integer), public.ai_refund(uuid) from public, anon, authenticated;
grant execute on function public.ai_consume(uuid, integer), public.ai_refund(uuid) to service_role;

create function public.ai_game_card(g public.games)
returns jsonb
language sql stable set search_path = public as $$
  select jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'release_date', g.release_date,
    'score', case when g.score is null then null else round(g.score) end,
    'genres', coalesce(g.data -> 'genres', '[]'::jsonb),
    'platforms', coalesce(g.data -> 'platforms', '[]'::jsonb),
    'cover', g.data ->> 'cover'
  );
$$;

create function public.ai_search_games(args jsonb)
returns jsonb
language plpgsql stable set search_path = public, extensions as $$
declare
  q text := nullif(trim(args ->> 'query'), '');
  q_embedding extensions.vector(384) := case
    when jsonb_typeof(args -> 'embedding') = 'array' then (args ->> 'embedding')::extensions.vector(384)
  end;
  genre text := nullif(trim(args ->> 'genre'), '');
  platform text := nullif(trim(args ->> 'platform'), '');
  min_score real := coalesce((args ->> 'min_score')::real, 0);
  upcoming boolean := coalesce((args ->> 'upcoming')::boolean, false);
  sort_by text := coalesce(args ->> 'sort', case when q is null then 'popularity' else 'relevance' end);
  lim integer := least(greatest(coalesce((args ->> 'limit')::integer, 5), 1), 10);
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  return coalesce((
    with matches as (
      select sg.id, sg.score from public.search_games(q, q_embedding, 50) sg where q is not null
    ),
    ranked as (
      select g.id, row_number() over (
        order by
          case when sort_by = 'relevance' then m.score end desc nulls last,
          case when sort_by = 'score' then g.score end desc nulls last,
          case when sort_by = 'popularity' then g.rating_count end desc nulls last,
          case when sort_by = 'hype' then g.hypes end desc nulls last,
          case when sort_by = 'date' then g.release_date end asc nulls last,
          g.id
      ) as ord
      from public.games g
      left join matches m on m.id = g.id
      where (q is null or m.id is not null)
        and (genre is null or g.data -> 'genres' ? genre or g.data -> 'themes' ? genre)
        and (platform is null or g.data -> 'platforms' ? platform)
        and (min_score = 0 or g.score >= min_score)
        and (not upcoming or g.release_date > now_ms)
    )
    select jsonb_agg(public.ai_game_card(g) order by r.ord)
    from (select id, ord from ranked order by ord limit lim) r
    join public.games g on g.id = r.id
  ), '[]'::jsonb);
end;
$$;

create function public.ai_upcoming_releases(args jsonb)
returns jsonb
language sql stable set search_path = public as $$
  select coalesce(jsonb_agg(public.ai_game_card(g) order by g.release_date, g.id), '[]'::jsonb)
  from (
    select * from public.games g
    where g.release_date > (extract(epoch from now()) * 1000)::bigint
      and (nullif(trim(args ->> 'genre'), '') is null
           or g.data -> 'genres' ? trim(args ->> 'genre') or g.data -> 'themes' ? trim(args ->> 'genre'))
      and (nullif(trim(args ->> 'platform'), '') is null or g.data -> 'platforms' ? trim(args ->> 'platform'))
    order by g.release_date, g.id
    limit least(greatest(coalesce((args ->> 'limit')::integer, 5), 1), 10)
  ) g;
$$;

create function public.ai_similar_games(args jsonb)
returns jsonb
language plpgsql stable set search_path = public, extensions as $$
declare
  base_id bigint := (args ->> 'game_id')::bigint;
  lim integer := least(greatest(coalesce((args ->> 'limit')::integer, 5), 1), 10);
begin
  if base_id is null and nullif(trim(args ->> 'name'), '') is not null then
    select g.id into base_id from public.games g
    order by similarity(g.name, trim(args ->> 'name')) desc, g.rating_count desc nulls last
    limit 1;
  end if;

  return coalesce((
    select jsonb_agg(public.ai_game_card(g) order by s.ord)
    from public.similar_games(base_id, lim) with ordinality as s(id, name, hypes, score, release_date, cover, genres, themes, platforms, ord)
    join public.games g on g.id = s.id
  ), '[]'::jsonb);
end;
$$;

create function public.ai_my_lists(args jsonb)
returns jsonb
language sql stable set search_path = public as $$
  select coalesce(jsonb_agg(public.ai_game_card(g) || jsonb_build_object('list', l.name) order by l.name, li.position, g.id), '[]'::jsonb)
  from public.lists l
  join public.list_items li on li.list_id = l.id
  join public.games g on g.id = li.game_id
  where nullif(trim(args ->> 'list'), '') is null or l.name = trim(args ->> 'list');
$$;

revoke execute on function
  public.ai_game_card(public.games),
  public.ai_search_games(jsonb),
  public.ai_upcoming_releases(jsonb),
  public.ai_similar_games(jsonb),
  public.ai_my_lists(jsonb)
from public, anon;
grant execute on function
  public.ai_game_card(public.games),
  public.ai_search_games(jsonb),
  public.ai_upcoming_releases(jsonb),
  public.ai_similar_games(jsonb),
  public.ai_my_lists(jsonb)
to authenticated;
