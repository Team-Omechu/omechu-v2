-- Omechu initial schema
-- Ports legacy Prisma/MySQL models (auth_user/user/menu/battle services) to Postgres for Supabase.
-- Conventions:
--   * auth identity lives in auth.users (Supabase-managed). public.profiles PK = auth.users.id (UUID).
--   * content tables use bigint generated always as identity.
--   * snake_case (matches legacy), timestamps default now() UTC.

set search_path = public;

-- =====================================================================
-- ENUMS
-- =====================================================================
create type prefer_kind as enum ('korean', 'western', 'chinese', 'japanese', 'other');
create type exercise_kind as enum ('cutting', 'bulking', 'maintenance');
create type battle_status as enum ('waiting', 'active', 'finished');
create type auth_provider as enum ('local', 'kakao', 'google');

-- =====================================================================
-- USER DOMAIN
-- =====================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone_num text,
  nickname text,
  exercise exercise_kind,
  provider auth_provider not null default 'local',
  provider_id text unique,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_nickname_idx on profiles (nickname);
create index profiles_email_idx on profiles (email);

create table agreement_consent (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references profiles(id) on delete cascade,
  terms_of_service boolean,
  privacy_policy boolean,
  location_service boolean,
  is_over14 boolean,
  marketing_consent boolean,
  created_at timestamptz not null default now()
);

create table allergy_min (
  id bigint generated always as identity primary key,
  allergy text not null unique
);

create table user_allergy (
  user_id uuid not null references profiles(id) on delete cascade,
  allergy_id bigint not null references allergy_min(id) on delete cascade,
  primary key (user_id, allergy_id)
);

create table prefer (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  prefer prefer_kind not null,
  unique (user_id, prefer)
);

create table inquiry (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz not null default now()
);
create index inquiry_user_idx on inquiry (user_id);

create table user_withdrawal (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- MEAL ALERTS
-- =====================================================================
create table meal_time (
  id bigint generated always as identity primary key,
  alert_time time,
  comment text
);

insert into meal_time (alert_time, comment) values
  ('08:00', '아침'),
  ('12:30', '점심'),
  ('18:30', '저녁'),
  ('22:00', '야식');

create table meal_alert (
  user_id uuid not null references profiles(id) on delete cascade,
  meal_id bigint not null references meal_time(id) on delete cascade,
  enabled boolean not null default true,
  alarm_time time,
  primary key (user_id, meal_id)
);

-- =====================================================================
-- MENU DOMAIN
-- =====================================================================
create table menu (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  calory bigint,
  carbo bigint,
  protein bigint,
  fat bigint,
  sodium bigint,
  image_link text,
  created_at timestamptz not null default now()
);
create index menu_name_idx on menu (name);

create table allergy (
  id bigint generated always as identity primary key,
  allergy text not null unique
);

create table vitamin (
  id bigint generated always as identity primary key,
  vitamin text not null unique
);

create table menu_allergy (
  menu_id bigint not null references menu(id) on delete cascade,
  allergy_id bigint not null references allergy(id) on delete cascade,
  primary key (menu_id, allergy_id)
);

create table menu_vitamin (
  menu_id bigint not null references menu(id) on delete cascade,
  vitamin_id bigint not null references vitamin(id) on delete cascade,
  primary key (menu_id, vitamin_id)
);

create table menu_tag (
  id bigint generated always as identity primary key,
  menu_id bigint not null references menu(id) on delete cascade,
  tag text not null
);
create index menu_tag_menu_idx on menu_tag (menu_id);
create index menu_tag_tag_idx on menu_tag (tag);

-- mukburim = 먹은 기록
create table mukburim (
  id bigint generated always as identity primary key,
  menu_id bigint not null references menu(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  eaten_at timestamptz not null default now()
);
create index mukburim_user_idx on mukburim (user_id);
create index mukburim_menu_idx on mukburim (menu_id);
create index mukburim_user_date_idx on mukburim (user_id, eaten_at desc);

create table recommend_except (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  menu_id bigint not null references menu(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, menu_id)
);
create index recommend_except_user_idx on recommend_except (user_id);

-- =====================================================================
-- BATTLE (회전판 배틀) — Realtime 마이그레이션은 후속
-- =====================================================================
create table battles (
  battle_id text primary key,
  creator_nickname text,
  status battle_status not null default 'active',
  participant_count int not null default 0,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  expires_at timestamptz not null
);
create index battles_status_idx on battles (status);
create index battles_expires_idx on battles (expires_at);

create table battle_menus (
  id bigint generated always as identity primary key,
  battle_id text not null references battles(battle_id) on delete cascade,
  menu_id bigint not null references menu(id) on delete cascade,
  menu_name text not null,
  boundary_angle numeric(5,2) not null,
  menu_order int not null,
  unique (battle_id, menu_id)
);
create index battle_menus_battle_idx on battle_menus (battle_id);

create table battle_participants (
  id bigint generated always as identity primary key,
  battle_id text not null references battles(battle_id) on delete cascade,
  nickname text not null,
  is_creator boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (battle_id, nickname)
);

create table spin_results (
  id bigint generated always as identity primary key,
  battle_id text not null references battles(battle_id) on delete cascade,
  nickname text not null,
  stopped_angle numeric(5,2) not null,
  closest_menu_id bigint not null references menu(id) on delete cascade,
  closest_menu_name text not null,
  distance_to_boundary numeric(5,2) not null,
  rank int not null,
  spun_at timestamptz not null default now(),
  unique (battle_id, nickname)
);
create index spin_results_battle_idx on spin_results (battle_id);
create index spin_results_rank_idx on spin_results (rank);

-- =====================================================================
-- updated_at TRIGGER
-- =====================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- =====================================================================
-- AUTH.USERS → PROFILES 자동 동기화
-- =====================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_val auth_provider;
  provider_id_val text;
begin
  -- supabase auth metadata로부터 provider 추출
  provider_val := case
    when new.raw_app_meta_data ->> 'provider' = 'kakao' then 'kakao'::auth_provider
    when new.raw_app_meta_data ->> 'provider' = 'google' then 'google'::auth_provider
    else 'local'::auth_provider
  end;
  provider_id_val := new.raw_user_meta_data ->> 'provider_id';

  insert into public.profiles (id, email, provider, provider_id, nickname)
  values (
    new.id,
    new.email,
    provider_val,
    provider_id_val,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =====================================================================
-- SEED: 기본 알러지/비타민 (frontend에서 선택지로 쓰임)
-- =====================================================================
insert into allergy (allergy) values
  ('난류'), ('우유'), ('메밀'), ('땅콩'), ('대두'), ('밀'),
  ('고등어'), ('게'), ('새우'), ('돼지고기'), ('복숭아'), ('토마토'),
  ('아황산류'), ('호두'), ('닭고기'), ('쇠고기'), ('오징어'), ('조개류'),
  ('잣')
on conflict (allergy) do nothing;

insert into allergy_min (allergy)
select allergy from allergy on conflict (allergy) do nothing;

insert into vitamin (vitamin) values
  ('비타민A'), ('비타민B1'), ('비타민B2'), ('비타민B6'), ('비타민B12'),
  ('비타민C'), ('비타민D'), ('비타민E'), ('비타민K'), ('엽산')
on conflict (vitamin) do nothing;
