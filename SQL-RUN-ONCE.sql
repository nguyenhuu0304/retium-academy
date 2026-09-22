-- Run once in Supabase SQL Editor. No existing quiz scores are deleted.
create table if not exists public.discord_player_names (
  player_key text primary key,
  discord_id text not null unique,
  discord_username text not null,
  updated_at timestamptz not null default now()
);
-- API accesses this table only with server-side Supabase secret key.
alter table public.discord_player_names enable row level security;
