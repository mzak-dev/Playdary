create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  created_at timestamptz not null default now()
);

create table public.games (
  id bigint primary key,
  name text not null,
  data jsonb not null default '{}',
  embedding extensions.vector(384),
  updated_at timestamptz not null default now()
);

create table public.ratings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id bigint not null references public.games (id) on delete cascade,
  score smallint not null check (score between 1 and 10),
  primary key (user_id, game_id)
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.list_items (
  list_id uuid not null references public.lists (id) on delete cascade,
  game_id bigint not null references public.games (id) on delete cascade,
  position integer not null default 0,
  primary key (list_id, game_id)
);

create table public.follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_id bigint not null references public.games (id) on delete cascade,
  primary key (user_id, game_id)
);

create table public.friendships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index games_name_trgm_idx on public.games using gin (name extensions.gin_trgm_ops);
create index games_embedding_idx on public.games using hnsw (embedding extensions.vector_cosine_ops);
create index ratings_game_id_idx on public.ratings (game_id);
create index lists_user_id_idx on public.lists (user_id);
create index list_items_game_id_idx on public.list_items (game_id);
create index follows_game_id_idx on public.follows (game_id);
create index friendships_friend_id_idx on public.friendships (friend_id);

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.ratings enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.follows enable row level security;
alter table public.friendships enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy games_select on public.games for select to authenticated using (true);

create policy ratings_owner on public.ratings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy follows_owner on public.follows for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy lists_owner on public.lists for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy list_items_owner on public.list_items for all to authenticated
  using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())))
  with check (exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())));

create policy friendships_select on public.friendships for select to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));
create policy friendships_request on public.friendships for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');
create policy friendships_accept on public.friendships for update to authenticated
  using (friend_id = (select auth.uid()) and status = 'pending')
  with check (friend_id = (select auth.uid()) and status = 'accepted');
create policy friendships_delete on public.friendships for delete to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '_' || left(new.id::text, 4)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create function public.friends_on_game(g bigint)
returns table (user_id uuid, username text, kind text, score smallint)
language sql stable security definer set search_path = '' as $$
  with my_friends as (
    select case when f.user_id = (select auth.uid()) then f.friend_id else f.user_id end as friend_id
    from public.friendships f
    where f.status = 'accepted'
      and (select auth.uid()) in (f.user_id, f.friend_id)
  )
  select p.id, p.username, 'follow', null::smallint
  from public.follows fo
  join my_friends mf on mf.friend_id = fo.user_id
  join public.profiles p on p.id = fo.user_id
  where fo.game_id = g
  union all
  select p.id, p.username, 'rated', r.score
  from public.ratings r
  join my_friends mf on mf.friend_id = r.user_id
  join public.profiles p on p.id = r.user_id
  where r.game_id = g;
$$;

revoke execute on function public.friends_on_game(bigint) from public, anon;
grant execute on function public.friends_on_game(bigint) to authenticated;

create function public.search_games(q text, q_embedding extensions.vector(384) default null, lim int default 20)
returns table (id bigint, name text, data jsonb, score real)
language sql stable set search_path = public, extensions as $$
  with by_title as (
    select g.id from public.games g
    where g.name % q or g.name ilike '%' || q || '%'
    order by similarity(g.name, q) desc
    limit 50
  ),
  by_meaning as (
    select g.id from public.games g
    where q_embedding is not null and g.embedding is not null
    order by g.embedding <=> q_embedding
    limit 50
  ),
  candidates as (
    select id from by_title union select id from by_meaning
  )
  select g.id, g.name, g.data,
    (0.5 * similarity(g.name, q)
      + case when q_embedding is not null and g.embedding is not null then 0.5 * (1 - (g.embedding <=> q_embedding)) else 0 end)::real as score
  from candidates c
  join public.games g on g.id = c.id
  order by score desc
  limit lim;
$$;

grant execute on function public.search_games(text, extensions.vector, int) to authenticated;
revoke execute on function public.search_games(text, extensions.vector, int) from public, anon;
