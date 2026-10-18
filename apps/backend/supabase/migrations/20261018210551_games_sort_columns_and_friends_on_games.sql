alter table public.games
  add column follows integer generated always as (coalesce((data ->> 'follows')::integer, 0)) stored,
  add column score real generated always as ((data ->> 'score')::real) stored,
  add column release_date bigint generated always as ((data ->> 'releaseDate')::bigint) stored;

create index games_follows_idx on public.games (follows desc);
create index games_release_date_idx on public.games (release_date);
create index games_score_idx on public.games (score desc nulls last);

create function public.friends_on_games(ids bigint[])
returns table (game_id bigint, username text, kind text, score smallint)
language sql stable security definer set search_path = '' as $$
  with my_friends as (
    select case when f.user_id = (select auth.uid()) then f.friend_id else f.user_id end as friend_id
    from public.friendships f
    where f.status = 'accepted'
      and (select auth.uid()) in (f.user_id, f.friend_id)
  )
  select fo.game_id, p.username, 'follow', null::smallint
  from public.follows fo
  join my_friends mf on mf.friend_id = fo.user_id
  join public.profiles p on p.id = fo.user_id
  where fo.game_id = any (ids)
  union all
  select r.game_id, p.username, 'rated', r.score
  from public.ratings r
  join my_friends mf on mf.friend_id = r.user_id
  join public.profiles p on p.id = r.user_id
  where r.game_id = any (ids);
$$;

revoke execute on function public.friends_on_games(bigint[]) from public, anon;
grant execute on function public.friends_on_games(bigint[]) to authenticated;
