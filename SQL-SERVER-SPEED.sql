-- Run in Supabase SQL Editor AFTER backing up. Preserves existing scores.
alter table public.quiz_attempts add column if not exists current_step integer not null default 0;
alter table public.quiz_attempts add column if not exists question_started_at timestamptz not null default now();
alter table public.quiz_attempts add column if not exists correct_count integer not null default 0;
alter table public.quiz_attempts add column if not exists earned_points integer not null default 0;
alter table public.quiz_attempts add column if not exists finished_at timestamptz;
-- Old client-score RPC must not remain executable by service_role.
revoke execute on function public.submit_discord_quiz(uuid,text,text,integer) from service_role;
drop function if exists public.submit_discord_quiz(uuid,text,text,integer);
create or replace function public.answer_discord_quiz(p_attempt_id uuid,p_discord_id text,p_step integer,p_answer integer,p_correct boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.quiz_attempts%rowtype; v_elapsed numeric; v_accepted integer; v_earned integer:=0; v_correct integer; v_points integer; v_next integer;
begin
 select * into a from public.quiz_attempts where id=p_attempt_id and discord_id=p_discord_id for update;
 if not found or a.used_at is not null or a.finished_at is not null then raise exception 'Quiz attempt already finished or not found';end if;
 if a.created_at < now()-interval '30 minutes' or p_step<>a.current_step or p_step not between 0 and 4 or p_answer not between -1 and 3 then raise exception 'Invalid or expired quiz step';end if;
 v_elapsed:=extract(epoch from (clock_timestamp()-a.question_started_at));
 v_accepted:=case when v_elapsed>10 then -1 else p_answer end;
 if v_accepted>=0 and p_correct then v_earned:=100+greatest(0,least(10,ceil(10-v_elapsed)::integer))*10;end if;
 v_correct:=a.correct_count+case when v_earned>0 then 1 else 0 end;
 v_points:=a.earned_points+v_earned;
 v_next:=p_step+1;
 update public.quiz_attempts set current_step=v_next,question_started_at=clock_timestamp(),correct_count=v_correct,earned_points=v_points,finished_at=case when v_next=5 then clock_timestamp() else null end where id=a.id;
 return jsonb_build_object('step',v_next,'acceptedAnswer',v_accepted,'correct',v_correct,'points',v_points,'finished',v_next=5);
end $$;
revoke all on function public.answer_discord_quiz(uuid,text,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.answer_discord_quiz(uuid,text,integer,integer,boolean) to service_role;
create or replace function public.submit_discord_quiz(p_attempt_id uuid,p_discord_id text,p_discord_name text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.quiz_attempts%rowtype; v_player public.players.id%TYPE; v_player_key text; v_day_start timestamptz;
begin
 select * into a from public.quiz_attempts where id=p_attempt_id and discord_id=p_discord_id for update;
 if not found or a.used_at is not null then raise exception 'Quiz attempt already used or not found';end if;
 if a.finished_at is null or a.current_step<>5 or a.created_at<now()-interval '30 minutes' then raise exception 'Quiz not finished or expired';end if;
 v_player_key:=left('d'||p_discord_id,15);
 select id into v_player from public.players where x_username=v_player_key;
 if v_player is null then insert into public.players(x_username) values(v_player_key) returning id into v_player;end if;
 v_day_start:=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 perform pg_advisory_xact_lock(hashtextextended(p_discord_id||':'||a.module_id||':'||v_day_start::text,0));
 if exists(select 1 from public.quiz_results where player_id=v_player and module_id=a.module_id and completed_at>=v_day_start and completed_at<v_day_start+interval '1 day') then raise exception 'This Discord account already saved this quiz today';end if;
 update public.quiz_attempts set used_at=now() where id=a.id;
 insert into public.quiz_results(player_id,module_id,correct_answers,points) values(v_player,a.module_id,a.correct_count,a.earned_points);
 insert into public.discord_player_names(player_key,discord_id,discord_username) values(v_player_key,p_discord_id,left(p_discord_name,80)) on conflict(player_key) do update set discord_username=excluded.discord_username,updated_at=now();
 return jsonb_build_object('correct',a.correct_count,'points',a.earned_points);
end $$;
revoke all on function public.submit_discord_quiz(uuid,text,text) from public,anon,authenticated;
grant execute on function public.submit_discord_quiz(uuid,text,text) to service_role;
