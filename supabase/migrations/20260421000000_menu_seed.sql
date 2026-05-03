-- 메뉴 + 카테고리 태그 시드.
-- 카테고리(태그)는 prefer_kind enum과 동일한 축으로 맞춤: korean / western / chinese / japanese / other.
-- 영양소 값은 추후 보정 대상 (null 허용).

insert into menu (name) values
  -- korean
  ('김치찌개'),
  ('된장찌개'),
  ('비빔밥'),
  ('돌솥비빔밥'),
  ('불고기'),
  ('제육볶음'),
  ('삼겹살'),
  ('갈비'),
  ('찜닭'),
  ('닭갈비'),
  ('닭볶음탕'),
  ('냉면'),
  ('국밥'),
  ('순대국'),
  ('부대찌개'),
  ('순두부찌개'),
  ('김밥'),
  ('떡볶이'),
  ('라면'),
  ('칼국수'),
  ('콩국수'),
  ('잡채'),
  ('보쌈'),
  ('족발'),
  ('해장국'),
  ('설렁탕'),
  -- western
  ('피자'),
  ('파스타'),
  ('햄버거'),
  ('스테이크'),
  ('샐러드'),
  ('리조또'),
  ('샌드위치'),
  ('오믈렛'),
  ('감바스'),
  ('브런치'),
  ('크림파스타'),
  ('토마토파스타'),
  -- chinese
  ('짜장면'),
  ('짬뽕'),
  ('탕수육'),
  ('마파두부'),
  ('양장피'),
  ('유산슬'),
  ('깐풍기'),
  ('마라탕'),
  ('마라샹궈'),
  ('볶음밥'),
  ('팔보채'),
  ('훠궈'),
  -- japanese
  ('초밥'),
  ('라멘'),
  ('돈카츠'),
  ('우동'),
  ('규동'),
  ('카츠동'),
  ('규카츠'),
  ('가라아게'),
  ('야키토리'),
  ('오코노미야키'),
  ('타코야키'),
  ('소바'),
  -- other
  ('쌀국수'),
  ('팟타이'),
  ('분짜'),
  ('카레'),
  ('케밥'),
  ('타코'),
  ('부리또'),
  ('똠양꿍'),
  ('덮밥'),
  ('반미')
on conflict do nothing;

-- 태그 연결.
-- menu.id는 identity라 이름→id 조회로 일괄 insert.
with tagmap(name, tag) as (
  values
    -- korean
    ('김치찌개','korean'),('된장찌개','korean'),('비빔밥','korean'),('돌솥비빔밥','korean'),
    ('불고기','korean'),('제육볶음','korean'),('삼겹살','korean'),('갈비','korean'),
    ('찜닭','korean'),('닭갈비','korean'),('닭볶음탕','korean'),('냉면','korean'),
    ('국밥','korean'),('순대국','korean'),('부대찌개','korean'),('순두부찌개','korean'),
    ('김밥','korean'),('떡볶이','korean'),('라면','korean'),('칼국수','korean'),
    ('콩국수','korean'),('잡채','korean'),('보쌈','korean'),('족발','korean'),
    ('해장국','korean'),('설렁탕','korean'),
    -- western
    ('피자','western'),('파스타','western'),('햄버거','western'),('스테이크','western'),
    ('샐러드','western'),('리조또','western'),('샌드위치','western'),('오믈렛','western'),
    ('감바스','western'),('브런치','western'),('크림파스타','western'),('토마토파스타','western'),
    -- chinese
    ('짜장면','chinese'),('짬뽕','chinese'),('탕수육','chinese'),('마파두부','chinese'),
    ('양장피','chinese'),('유산슬','chinese'),('깐풍기','chinese'),('마라탕','chinese'),
    ('마라샹궈','chinese'),('볶음밥','chinese'),('팔보채','chinese'),('훠궈','chinese'),
    -- japanese
    ('초밥','japanese'),('라멘','japanese'),('돈카츠','japanese'),('우동','japanese'),
    ('규동','japanese'),('카츠동','japanese'),('규카츠','japanese'),('가라아게','japanese'),
    ('야키토리','japanese'),('오코노미야키','japanese'),('타코야키','japanese'),('소바','japanese'),
    -- other
    ('쌀국수','other'),('팟타이','other'),('분짜','other'),('카레','other'),
    ('케밥','other'),('타코','other'),('부리또','other'),('똠양꿍','other'),
    ('덮밥','other'),('반미','other')
)
insert into menu_tag (menu_id, tag)
select m.id, t.tag
from tagmap t
join menu m on m.name = t.name
on conflict do nothing;
