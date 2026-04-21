-- Row Level Security 정책.
-- 원칙:
--   * user-owned 테이블: 본인만 r/w (auth.uid() = user_id).
--   * 공개 컨텐츠(menu / allergy / vitamin / menu_tag …): 누구나 읽기, service_role만 쓰기.
--   * battle*: 참여자 & 로그인 유저에게 읽기 허용, 쓰기는 Edge Function(service_role) 경유.
--   * profiles: 본인 + 인증 유저는 닉네임 수준 열람(친구 검색용) — 여기서는 본인만 전체 select로 잠금. 필요 시 view 추가.

-- --------------------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- insert는 트리거가 담당 (security definer). 일반 유저 insert 차단.

-- --------------------------------------------------------------------
-- AGREEMENT_CONSENT
-- --------------------------------------------------------------------
alter table public.agreement_consent enable row level security;

create policy "agreement_rw_self"
  on public.agreement_consent for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- USER_ALLERGY / PREFER / INQUIRY / RECOMMEND_EXCEPT / MEAL_ALERT
-- --------------------------------------------------------------------
alter table public.user_allergy enable row level security;
create policy "user_allergy_rw_self"
  on public.user_allergy for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.prefer enable row level security;
create policy "prefer_rw_self"
  on public.prefer for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.inquiry enable row level security;
create policy "inquiry_rw_self"
  on public.inquiry for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.recommend_except enable row level security;
create policy "recommend_except_rw_self"
  on public.recommend_except for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.meal_alert enable row level security;
create policy "meal_alert_rw_self"
  on public.meal_alert for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.mukburim enable row level security;
create policy "mukburim_rw_self"
  on public.mukburim for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 공개 읽기 (menu / allergy / vitamin / allergy_min / meal_time / menu_tag / menu_allergy / menu_vitamin)
-- --------------------------------------------------------------------
alter table public.menu enable row level security;
create policy "menu_read_all" on public.menu for select using (true);

alter table public.menu_tag enable row level security;
create policy "menu_tag_read_all" on public.menu_tag for select using (true);

alter table public.menu_allergy enable row level security;
create policy "menu_allergy_read_all" on public.menu_allergy for select using (true);

alter table public.menu_vitamin enable row level security;
create policy "menu_vitamin_read_all" on public.menu_vitamin for select using (true);

alter table public.allergy enable row level security;
create policy "allergy_read_all" on public.allergy for select using (true);

alter table public.allergy_min enable row level security;
create policy "allergy_min_read_all" on public.allergy_min for select using (true);

alter table public.vitamin enable row level security;
create policy "vitamin_read_all" on public.vitamin for select using (true);

alter table public.meal_time enable row level security;
create policy "meal_time_read_all" on public.meal_time for select using (true);

-- --------------------------------------------------------------------
-- BATTLE: 인증된 유저는 읽기. 쓰기는 Edge Function(service_role)만.
-- --------------------------------------------------------------------
alter table public.battles enable row level security;
create policy "battles_read_authed" on public.battles for select
  to authenticated using (true);

alter table public.battle_menus enable row level security;
create policy "battle_menus_read_authed" on public.battle_menus for select
  to authenticated using (true);

alter table public.battle_participants enable row level security;
create policy "battle_participants_read_authed" on public.battle_participants for select
  to authenticated using (true);

alter table public.spin_results enable row level security;
create policy "spin_results_read_authed" on public.spin_results for select
  to authenticated using (true);

-- --------------------------------------------------------------------
-- USER_WITHDRAWAL — 본인만 기록 쓰기. 읽기는 service_role만.
-- --------------------------------------------------------------------
alter table public.user_withdrawal enable row level security;
create policy "user_withdrawal_insert_self" on public.user_withdrawal for insert
  with check (auth.uid() = user_id);
