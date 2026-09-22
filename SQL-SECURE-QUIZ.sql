-- Run once in Supabase SQL Editor. Does not delete previous scores.
create table if not exists public.quiz_attempts (
 id uuid primary key, discord_id text not null, module_id text not null,
 question_ids integer[] not null, created_at timestamptz not null default now(), used_at timestamptz
);
create unique index if not exists quiz_attempts_id_discord on public.quiz_attempts(id,discord_id);
alter table public.quiz_attempts enable row level security;
-- Assumes existing public.players(x_username) and quiz_results(player_id,module_id,correct_answers,points).
create or replace function public.submit_discord_quiz(p_attempt_id uuid,p_discord_id text,p_discord_name text,p_correct integer)
returns void language plpgsql security definer set search_path=public as $$
declare a public.quiz_attempts%rowtype; player public.players.id%TYPE; player_key text; day_start timestamptz;
begin
 if p_correct not between 0 and 5 or p_discord_id !~ '^[0-9]{17,20}$' then raise exception 'Invalid submission';end if;
 select * into a from public.quiz_attempts where id=p_attempt_id and discord_id=p_discord_id for update;
 if not found or a.used_at is not null then raise exception 'Quiz attempt already used or not found';end if;
 if a.created_at < now()-interval '30 minutes' then raise exception 'Quiz attempt expired';end if;
 player_key := left('d'||p_discord_id,15);
 select id into player from public.players where x_username=player_key;
 if player is null then
  insert into public.players(x_username) values(player_key) returning id into player;
 end if;
 day_start := date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 perform pg_advisory_xact_lock(hashtextextended(p_discord_id||':'||a.module_id||':'||day_start::text,0));
 if exists(select 1 from public.quiz_results where player_id=player and module_id=a.module_id and completed_at>=day_start and completed_at<day_start+interval '1 day') then
  raise exception 'This Discord account already saved this quiz today';
 end if;
 update public.quiz_attempts set used_at=now() where id=a.id;
 insert into public.quiz_results(player_id,module_id,correct_answers,points) values(player,a.module_id,p_correct,p_correct*100);
 insert into public.discord_player_names(player_key,discord_id,discord_username) values(player_key,p_discord_id,left(p_discord_name,80)) on conflict(player_key) do update set discord_username=excluded.discord_username,updated_at=now();
end $$;
revoke all on function public.submit_discord_quiz(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.submit_discord_quiz(uuid,text,text,integer) to service_role;
