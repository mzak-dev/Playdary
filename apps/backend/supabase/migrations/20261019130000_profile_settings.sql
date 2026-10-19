alter table public.profiles
  add column privacy text not null default 'friends' check (privacy in ('everyone', 'friends', 'private')),
  add column notifications jsonb not null default '{"friends": true, "release": true, "digest": false}';
