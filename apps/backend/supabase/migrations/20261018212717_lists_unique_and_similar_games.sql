alter table public.lists add constraint lists_user_id_name_key unique (user_id, name);

create function public.similar_games(p_game_id bigint, p_limit integer default 6)
returns table (
  id bigint, name text, hypes integer, score real, release_date bigint,
  cover text, genres text[], themes text[], platforms text[]
)
language sql stable set search_path = public, extensions as $$
  select
    g.id, g.name, g.hypes, g.score, g.release_date,
    g.data ->> 'cover',
    array(select jsonb_array_elements_text(g.data -> 'genres')),
    array(select jsonb_array_elements_text(g.data -> 'themes')),
    array(select jsonb_array_elements_text(g.data -> 'platforms'))
  from public.games g
  where g.id <> p_game_id
    and g.embedding is not null
    and exists (select 1 from public.games s where s.id = p_game_id and s.embedding is not null)
  order by g.embedding <=> (select s.embedding from public.games s where s.id = p_game_id)
  limit p_limit;
$$;

revoke execute on function public.similar_games(bigint, integer) from public, anon;
grant execute on function public.similar_games(bigint, integer) to authenticated;
