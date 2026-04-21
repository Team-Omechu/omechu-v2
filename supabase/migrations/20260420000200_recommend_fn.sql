-- 추천 RPC.
-- 기존 Express /menu/recommend/random 로직:
--   - 유저 알러지 제외
--   - recommend_except 활성 제외
--   - 선호 태그(prefer)가 있으면 우선, 없으면 전체
--   - tags[] 필터(선택)
--   - 랜덤 N개.

create or replace function public.recommend_random(
  tags text[] default null,
  limit_count int default 1
)
returns setof menu
language plpgsql
stable
security invoker
as $$
declare
  uid uuid := auth.uid();
begin
  return query
  select m.*
  from menu m
  where
    -- 유저가 로그인한 경우 본인 알러지/제외 필터
    (
      uid is null
      or not exists (
        select 1 from menu_allergy ma
        join user_allergy ua
          on ua.allergy_id = (
            select am.id from allergy_min am where am.allergy = (
              select a.allergy from allergy a where a.id = ma.allergy_id
            )
          )
        where ma.menu_id = m.id and ua.user_id = uid
      )
    )
    and (
      uid is null
      or not exists (
        select 1 from recommend_except re
        where re.user_id = uid and re.menu_id = m.id and re.active
      )
    )
    and (
      tags is null
      or exists (
        select 1 from menu_tag mt
        where mt.menu_id = m.id and mt.tag = any(tags)
      )
    )
  order by random()
  limit greatest(limit_count, 1);
end;
$$;

grant execute on function public.recommend_random(text[], int) to authenticated, anon;

-- mukburim 통계 RPC
create or replace function public.mukburim_monthly_stats(
  year_val int,
  month_val int
)
returns table (day int, count bigint)
language sql
stable
security invoker
as $$
  select
    extract(day from eaten_at)::int as day,
    count(*)::bigint
  from mukburim
  where user_id = auth.uid()
    and extract(year from eaten_at) = year_val
    and extract(month from eaten_at) = month_val
  group by day
  order by day;
$$;

grant execute on function public.mukburim_monthly_stats(int, int) to authenticated;
