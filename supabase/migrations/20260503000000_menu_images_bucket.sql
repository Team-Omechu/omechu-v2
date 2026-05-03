-- 메뉴 이미지 전용 퍼블릭 버킷.
-- 읽기는 누구나, 쓰기는 service_role(서버/CLI)만.

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = excluded.public;

-- 퍼블릭 read (anon + authenticated)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'menu-images public read'
  ) then
    create policy "menu-images public read"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'menu-images');
  end if;
end $$;
