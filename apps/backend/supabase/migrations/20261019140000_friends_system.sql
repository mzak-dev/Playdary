alter table public.ratings add column created_at timestamptz not null default now();
alter table public.follows add column created_at timestamptz not null default now();
alter table public.list_items add column created_at timestamptz not null default now();
alter table public.friendships add column created_at timestamptz not null default now();

create unique index friendships_pair_idx on public.friendships (least(user_id, friend_id), greatest(user_id, friend_id));

create table public.friend_mutes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  primary key (user_id, friend_id)
);

alter table public.friend_mutes enable row level security;

create policy friend_mutes_owner on public.friend_mutes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.my_friend_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select case when f.user_id = (select auth.uid()) then f.friend_id else f.user_id end
  from public.friendships f
  where f.status = 'accepted' and (select auth.uid()) in (f.user_id, f.friend_id);
$$;

create function public.can_view(owner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select owner = (select auth.uid()) or exists (
    select 1 from public.profiles p
    where p.id = owner
      and (p.privacy = 'everyone' or (p.privacy = 'friends' and owner in (select public.my_friend_ids())))
  );
$$;

create function public.mutual_friends(other uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from public.my_friend_ids() as mine (id)
  where mine.id in (
    select case when f.user_id = other then f.friend_id else f.user_id end
    from public.friendships f
    where f.status = 'accepted' and other in (f.user_id, f.friend_id)
  );
$$;

create function public.taste_match(other uuid) returns real
language sql stable security definer set search_path = '' as $$
  select (1 - avg(abs(a.score - b.score)) / 9.0)::real
  from public.ratings a
  join public.ratings b on b.game_id = a.game_id
  where a.user_id = (select auth.uid()) and b.user_id = other;
$$;

create function public.friend_events(p_users uuid[], p_limit int)
returns table (friend_id uuid, username text, kind text, game_id bigint, game_name text, cover text, score smallint, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select e.friend_id, e.username, e.kind, e.game_id, e.game_name, e.cover, e.score, e.created_at
  from (
    select r.user_id as friend_id, p.username, 'rated' as kind, g.id as game_id, g.name as game_name, g.data ->> 'cover' as cover, r.score, r.created_at
    from public.ratings r
    join public.profiles p on p.id = r.user_id
    join public.games g on g.id = r.game_id
    where r.user_id = any (p_users)
    union all
    select fo.user_id, p.username, 'follow', g.id, g.name, g.data ->> 'cover', null::smallint, fo.created_at
    from public.follows fo
    join public.profiles p on p.id = fo.user_id
    join public.games g on g.id = fo.game_id
    where fo.user_id = any (p_users)
    union all
    select l.user_id, p.username, case l.name when 'done' then 'done' else 'wish' end, g.id, g.name, g.data ->> 'cover', null::smallint, li.created_at
    from public.list_items li
    join public.lists l on l.id = li.list_id
    join public.profiles p on p.id = l.user_id
    join public.games g on g.id = li.game_id
    where l.user_id = any (p_users) and l.name in ('done', 'wishlist')
  ) e
  where public.can_view(e.friend_id)
  order by e.created_at desc
  limit p_limit;
$$;

create function public.friend_activity(p_limit int default 40)
returns table (friend_id uuid, username text, kind text, game_id bigint, game_name text, cover text, score smallint, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select * from public.friend_events(
    array(
      select i from public.my_friend_ids() as i
      where not exists (select 1 from public.friend_mutes m where m.user_id = (select auth.uid()) and m.friend_id = i)
    ),
    least(p_limit, 100)
  );
$$;

create function public.friend_cards()
returns table (friend_id uuid, username text, since timestamptz, done int, rated int, match real, playing_id bigint, playing_name text, muted boolean)
language sql stable security definer set search_path = '' as $$
  select
    p.id,
    p.username,
    f.created_at,
    case when v.ok then (select count(*)::int from public.list_items li join public.lists l on l.id = li.list_id where l.user_id = p.id and l.name = 'done') end,
    case when v.ok then (select count(*)::int from public.ratings r where r.user_id = p.id) end,
    case when v.ok then public.taste_match(p.id) end,
    pg.id,
    pg.name,
    exists (select 1 from public.friend_mutes m where m.user_id = (select auth.uid()) and m.friend_id = p.id)
  from public.friendships f
  join public.profiles p on p.id = case when f.user_id = (select auth.uid()) then f.friend_id else f.user_id end
  cross join lateral (select public.can_view(p.id) as ok) v
  left join lateral (
    select g.id, g.name
    from public.list_items li
    join public.lists l on l.id = li.list_id
    join public.games g on g.id = li.game_id
    where v.ok and l.user_id = p.id and l.name = 'playing'
    order by li.created_at desc
    limit 1
  ) pg on true
  where f.status = 'accepted' and (select auth.uid()) in (f.user_id, f.friend_id)
  order by p.username;
$$;

create function public.friend_detail(p_friend uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  visible boolean := public.can_view(p_friend);
begin
  if p_friend not in (select public.my_friend_ids()) then
    return null;
  end if;

  return jsonb_build_object(
    'common', case when visible then (
      select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name), '[]'::jsonb)
      from (
        select g.id, g.name
        from public.games g
        where exists (select 1 from public.list_items li join public.lists l on l.id = li.list_id where l.user_id = me and li.game_id = g.id)
          and exists (select 1 from public.list_items li join public.lists l on l.id = li.list_id where l.user_id = p_friend and li.game_id = g.id)
        order by g.name
        limit 12
      ) c
    ) else '[]'::jsonb end,
    'events', (
      select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc), '[]'::jsonb)
      from public.friend_events(array[p_friend], 10) e
    )
  );
end;
$$;

create function public.friend_requests()
returns table (direction text, user_id uuid, username text, created_at timestamptz, mutual int)
language sql stable security definer set search_path = '' as $$
  select
    case when f.friend_id = (select auth.uid()) then 'incoming' else 'outgoing' end,
    p.id,
    p.username,
    f.created_at,
    public.mutual_friends(p.id)
  from public.friendships f
  join public.profiles p on p.id = case when f.friend_id = (select auth.uid()) then f.user_id else f.friend_id end
  where f.status = 'pending' and (select auth.uid()) in (f.user_id, f.friend_id)
  order by f.created_at desc;
$$;

create function public.search_users(q text)
returns table (user_id uuid, username text, relation text, mutual int)
language sql stable security definer set search_path = '' as $$
  select
    p.id,
    p.username,
    coalesce(
      (
        select case when f.status = 'accepted' then 'friend' when f.friend_id = (select auth.uid()) then 'incoming' else 'outgoing' end
        from public.friendships f
        where (f.user_id = (select auth.uid()) and f.friend_id = p.id) or (f.user_id = p.id and f.friend_id = (select auth.uid()))
      ),
      'none'
    ),
    public.mutual_friends(p.id)
  from public.profiles p
  where char_length(trim(q)) >= 2
    and p.id <> (select auth.uid())
    and p.username ilike '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%'
  order by lower(p.username) = lower(trim(q)) desc, p.username
  limit 8;
$$;

create or replace function public.friends_on_game(g bigint)
returns table (user_id uuid, username text, kind text, score smallint)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, 'follow', null::smallint
  from public.follows fo
  join public.profiles p on p.id = fo.user_id
  where fo.game_id = g and fo.user_id in (select public.my_friend_ids()) and public.can_view(fo.user_id)
  union all
  select p.id, p.username, 'rated', r.score
  from public.ratings r
  join public.profiles p on p.id = r.user_id
  where r.game_id = g and r.user_id in (select public.my_friend_ids()) and public.can_view(r.user_id);
$$;

create or replace function public.friends_on_games(ids bigint[])
returns table (game_id bigint, username text, kind text, score smallint)
language sql stable security definer set search_path = '' as $$
  select fo.game_id, p.username, 'follow', null::smallint
  from public.follows fo
  join public.profiles p on p.id = fo.user_id
  where fo.game_id = any (ids) and fo.user_id in (select public.my_friend_ids()) and public.can_view(fo.user_id)
  union all
  select r.game_id, p.username, 'rated', r.score
  from public.ratings r
  join public.profiles p on p.id = r.user_id
  where r.game_id = any (ids) and r.user_id in (select public.my_friend_ids()) and public.can_view(r.user_id);
$$;

revoke execute on function public.my_friend_ids() from public, anon, authenticated;
revoke execute on function public.can_view(uuid) from public, anon, authenticated;
revoke execute on function public.mutual_friends(uuid) from public, anon, authenticated;
revoke execute on function public.taste_match(uuid) from public, anon, authenticated;
revoke execute on function public.friend_events(uuid[], int) from public, anon, authenticated;

revoke execute on function public.friend_activity(int) from public, anon;
revoke execute on function public.friend_cards() from public, anon;
revoke execute on function public.friend_detail(uuid) from public, anon;
revoke execute on function public.friend_requests() from public, anon;
revoke execute on function public.search_users(text) from public, anon;
grant execute on function public.friend_activity(int) to authenticated;
grant execute on function public.friend_cards() to authenticated;
grant execute on function public.friend_detail(uuid) to authenticated;
grant execute on function public.friend_requests() to authenticated;
grant execute on function public.search_users(text) to authenticated;
