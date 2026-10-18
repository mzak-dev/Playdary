create function public.random_covers(p_count integer default 28)
returns setof text
language sql stable set search_path = public as $$
  select g.data ->> 'cover'
  from public.games g tablesample bernoulli (20)
  where g.data ->> 'cover' is not null and g.rating_count >= 20
  order by random()
  limit p_count;
$$;

revoke execute on function public.random_covers(integer) from public, anon;
grant execute on function public.random_covers(integer) to authenticated;
