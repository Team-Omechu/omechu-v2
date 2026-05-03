-- 메뉴 배틀 실시간 마이그레이션.
-- 목적:
--   1) 기존 배틀 스키마 보강 (title, auth_user_id, rank nullable, participant_count drop)
--   2) RPC 7개 (create / join / spin / finish / leave / rankings / public_winner)
--   3) Realtime publication 등록
--   4) pg_cron 자동 정리 (KST 04:00)
--
-- 설계 결정:
--   - battle_id = 6자리 숫자 코드, 충돌 시 insert ... on conflict 으로 10회 재시도 (~10^6 풀)
--   - rank 컬럼은 항상 NULL. 랭킹은 battle_rankings RPC가 row_number()로 계산 → 동시 spin 경합 제거
--   - participant_count는 select count(*)로 충분하므로 컬럼 제거
--   - 권한 모델: 익명 로그인 사용자도 'authenticated' role을 얻으므로 RLS 그대로. RPC는 SECURITY DEFINER.
--   - battle_public_winner: anon에게도 OG metadata용 우승자 노출 (닉/메뉴명/이미지만)

set search_path = public;

-- =====================================================================
-- 1. 스키마 보강
-- =====================================================================
alter table battles
  add column if not exists title text not null default '오늘의 메뉴 배틀';

alter table battles
  drop column if exists participant_count;

alter table battle_participants
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create index if not exists battle_participants_auth_idx
  on battle_participants(auth_user_id);

alter table spin_results alter column rank drop not null;

-- =====================================================================
-- 2. RPC
-- =====================================================================

-- 2.1 battle_create ---------------------------------------------------
create or replace function public.battle_create(
  p_title text,
  p_menu_ids bigint[]
)
returns table (battle_id text, title text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_id text;
  v_title text;
  v_expires timestamptz := now() + interval '1 hour';
  v_count int;
  v_step numeric;
  v_idx int := 0;
  v_inserted boolean := false;
  v_attempt int;
  v_menu record;
begin
  if uid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  v_count := coalesce(array_length(p_menu_ids, 1), 0);
  if v_count < 2 or v_count > 8 then
    raise exception 'menu_count_invalid' using errcode = 'P0002';
  end if;

  v_title := coalesce(nullif(btrim(p_title), ''), '오늘의 메뉴 배틀');

  for v_attempt in 1..10 loop
    v_id := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    begin
      insert into battles (battle_id, creator_nickname, status, title, expires_at)
      values (v_id, null, 'active', v_title, v_expires);
      v_inserted := true;
      exit;
    exception when unique_violation then
      continue;
    end;
  end loop;

  if not v_inserted then
    raise exception 'code_pool_busy' using errcode = 'P0001';
  end if;

  v_step := 360.0 / v_count;
  for v_menu in
    select m.id as mid, m.name as mname
    from unnest(p_menu_ids) with ordinality as t(menu_id, ord)
    join menu m on m.id = t.menu_id
    order by t.ord
  loop
    insert into battle_menus
      (battle_id, menu_id, menu_name, boundary_angle, menu_order)
    values
      (v_id, v_menu.mid, v_menu.mname,
       round(((v_idx + 0.5) * v_step)::numeric, 2), v_idx);
    v_idx := v_idx + 1;
  end loop;

  return query select v_id, v_title, v_expires;
end;
$$;
grant execute on function public.battle_create(text, bigint[]) to authenticated;

-- 2.2 battle_join -----------------------------------------------------
create or replace function public.battle_join(
  p_battle_id text,
  p_nickname text
)
returns table (battle_id text, nickname text, is_creator boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_battle battles%rowtype;
  v_nick text;
  v_is_creator boolean;
  v_existing battle_participants%rowtype;
begin
  if uid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  v_nick := btrim(coalesce(p_nickname, ''));
  if v_nick !~ '^[a-zA-Z0-9가-힣]{1,20}$' then
    raise exception 'nickname_invalid' using errcode = 'P0003';
  end if;

  select * into v_battle
    from battles where battles.battle_id = p_battle_id
    for update;
  if not found then
    raise exception 'battle_not_found' using errcode = 'P0004';
  end if;
  if v_battle.expires_at < now() then
    raise exception 'battle_expired' using errcode = 'P0005';
  end if;
  if v_battle.status = 'finished' then
    raise exception 'battle_finished' using errcode = 'P0006';
  end if;

  select * into v_existing
    from battle_participants
    where battle_participants.battle_id = p_battle_id
      and battle_participants.auth_user_id = uid
    limit 1;

  if found then
    if v_existing.nickname = v_nick then
      return query select v_existing.battle_id, v_existing.nickname, v_existing.is_creator;
      return;
    else
      raise exception 'already_joined_as_other' using errcode = 'P0007';
    end if;
  end if;

  perform 1 from battle_participants
    where battle_participants.battle_id = p_battle_id
      and battle_participants.nickname = v_nick;
  if found then
    raise exception 'nickname_taken' using errcode = 'P0008';
  end if;

  v_is_creator := not exists (
    select 1 from battle_participants
    where battle_participants.battle_id = p_battle_id
  );

  insert into battle_participants
    (battle_id, nickname, is_creator, auth_user_id)
  values
    (p_battle_id, v_nick, v_is_creator, uid);

  if v_is_creator then
    update battles
      set creator_nickname = v_nick
      where battles.battle_id = p_battle_id;
  end if;

  return query select p_battle_id, v_nick, v_is_creator;
end;
$$;
grant execute on function public.battle_join(text, text) to authenticated;

-- 2.3 battle_spin -----------------------------------------------------
create or replace function public.battle_spin(
  p_battle_id text,
  p_nickname text
)
returns table (
  nickname text,
  stopped_angle numeric,
  closest_menu_name text,
  distance_to_boundary numeric,
  spun_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_battle battles%rowtype;
  v_part battle_participants%rowtype;
  v_angle numeric(5,2);
  v_menu record;
  v_now timestamptz := now();
begin
  if uid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select * into v_battle from battles where battles.battle_id = p_battle_id;
  if not found then
    raise exception 'battle_not_found' using errcode = 'P0004';
  end if;
  if v_battle.status = 'finished' then
    raise exception 'battle_finished' using errcode = 'P0006';
  end if;

  select * into v_part
    from battle_participants
    where battle_participants.battle_id = p_battle_id
      and battle_participants.nickname = p_nickname
      and battle_participants.auth_user_id = uid;
  if not found then
    raise exception 'not_participant' using errcode = 'P0009';
  end if;

  perform 1 from spin_results
    where spin_results.battle_id = p_battle_id
      and spin_results.nickname = p_nickname;
  if found then
    raise exception 'already_spun' using errcode = 'P0010';
  end if;

  v_angle := round((random() * 360)::numeric, 2);

  select bm.menu_id as mid, bm.menu_name as mname,
         least(abs(v_angle - bm.boundary_angle),
               360 - abs(v_angle - bm.boundary_angle)) as dist
    into v_menu
  from battle_menus bm
  where bm.battle_id = p_battle_id
  order by dist asc
  limit 1;

  insert into spin_results
    (battle_id, nickname, stopped_angle, closest_menu_id, closest_menu_name,
     distance_to_boundary, rank, spun_at)
  values
    (p_battle_id, p_nickname, v_angle, v_menu.mid, v_menu.mname,
     round(v_menu.dist::numeric, 2), null, v_now);

  return query select
    p_nickname, v_angle, v_menu.mname,
    round(v_menu.dist::numeric, 2), v_now;
end;
$$;
grant execute on function public.battle_spin(text, text) to authenticated;

-- 2.4 battle_finish ---------------------------------------------------
create or replace function public.battle_finish(
  p_battle_id text,
  p_nickname text
)
returns table (battle_id text, status battle_status, finished_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_part battle_participants%rowtype;
  v_finished timestamptz := now();
begin
  if uid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select * into v_part
    from battle_participants
    where battle_participants.battle_id = p_battle_id
      and battle_participants.nickname = p_nickname
      and battle_participants.auth_user_id = uid;
  if not found then
    raise exception 'not_participant' using errcode = 'P0009';
  end if;
  if not v_part.is_creator then
    raise exception 'not_creator' using errcode = 'P0011';
  end if;

  update battles
    set status = 'finished', finished_at = v_finished
    where battles.battle_id = p_battle_id
      and battles.status <> 'finished';

  return query select p_battle_id, 'finished'::battle_status, v_finished;
end;
$$;
grant execute on function public.battle_finish(text, text) to authenticated;

-- 2.5 battle_leave ----------------------------------------------------
create or replace function public.battle_leave(
  p_battle_id text,
  p_nickname text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  delete from battle_participants
    where battle_participants.battle_id = p_battle_id
      and battle_participants.nickname = p_nickname
      and battle_participants.auth_user_id = uid;
end;
$$;
grant execute on function public.battle_leave(text, text) to authenticated;

-- 2.6 battle_rankings (read-side rank) --------------------------------
create or replace function public.battle_rankings(p_battle_id text)
returns table (
  rank int,
  nickname text,
  closest_menu_name text,
  distance_to_boundary numeric,
  spun_at timestamptz
)
language sql
stable
security invoker
as $$
  select
    row_number() over (
      order by sr.distance_to_boundary asc, sr.spun_at asc
    )::int as rank,
    sr.nickname,
    sr.closest_menu_name,
    sr.distance_to_boundary,
    sr.spun_at
  from spin_results sr
  where sr.battle_id = p_battle_id;
$$;
grant execute on function public.battle_rankings(text) to authenticated, anon;

-- 2.7 battle_public_winner (OG metadata용 — anon 가능) ---------------
create or replace function public.battle_public_winner(p_battle_id text)
returns table (
  battle_id text,
  status battle_status,
  title text,
  winner_nickname text,
  winner_menu_name text,
  winner_menu_image text
)
language sql
stable
security definer
set search_path = public
as $$
  with ranked as (
    select sr.nickname,
           sr.closest_menu_name,
           sr.closest_menu_id,
           row_number() over (
             order by sr.distance_to_boundary asc, sr.spun_at asc
           ) as rk
    from spin_results sr
    where sr.battle_id = p_battle_id
  )
  select
    b.battle_id,
    b.status,
    b.title,
    r.nickname,
    r.closest_menu_name,
    m.image_link
  from battles b
  left join ranked r on r.rk = 1
  left join menu m on m.id = r.closest_menu_id
  where b.battle_id = p_battle_id;
$$;
grant execute on function public.battle_public_winner(text) to anon, authenticated;

-- =====================================================================
-- 3. Realtime publication
-- =====================================================================
do $$ begin
  begin
    alter publication supabase_realtime add table public.battles;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.battle_participants;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.spin_results;
  exception when duplicate_object then null; end;
end $$;

-- =====================================================================
-- 4. pg_cron 자동 정리 (KST 04:00 = UTC 19:00)
-- =====================================================================
do $$ begin
  create extension if not exists pg_cron with schema extensions;
exception when others then
  raise notice 'pg_cron extension setup skipped: %', sqlerrm;
end $$;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'omechu-battle-cleanup';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'omechu-battle-cleanup',
    '0 19 * * *',
    $cmd$
      delete from public.battles
        where status = 'finished'
           or expires_at < now() - interval '1 day'
    $cmd$
  );
exception when undefined_table or undefined_function then
  raise notice 'pg_cron not available, skipping job schedule';
end $$;
