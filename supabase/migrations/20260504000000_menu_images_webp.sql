-- 메뉴 이미지 link .png → .webp 일괄 갱신.
-- 배경: Supabase Storage 메뉴 이미지를 1200px WebP q85로 정규화 (162MB → 16MB, -90%).
-- next/image 변환 효율 ↑, Vercel transform 한도 마진 ↑, Storage egress ↓.
-- WebP 파일은 별도 스크립트로 미리 업로드됨.

update menu
set image_link = replace(image_link, '.png', '.webp')
where image_link like '%.png';
