import { Metadata } from "next";

import { MenuDetail } from "@/shared/config/menu";
import { BASE_URL } from "@/shared/constants/url";

/**
 * 메뉴 상세 정보를 기반으로 메타데이터 생성
 * @param menuDetail - 메뉴 상세 정보 (null인 경우 폴백 메타데이터 반환)
 * @param pageType - "랜덤 추천" | "맞춤 추천"
 * @param currentPath - 현재 페이지 경로 (canonical URL용)
 */
export function generateMenuMetadata(
  menuDetail: MenuDetail | null,
  pageType: "랜덤 추천" | "맞춤 추천",
  currentPath: string,
): Metadata {
  // MenuDetail이 null이면 폴백 메타데이터 반환
  if (!menuDetail) {
    return {
      title: `${pageType} | 오메추`,
      description: "오늘 뭐 먹지? 오메추에서 메뉴를 추천받아보세요.",
      robots: { index: false, follow: true },
    };
  }

  const { name, description, image_link, allergic, calory, protein } =
    menuDetail;

  // 페이지 타이틀: "김밥 맞춤 추천"
  const title = `${name} ${pageType}`;

  // 메타 설명: 메뉴 설명 + 영양 정보 (150-160자 제한)
  const metaDescription = description
    ? `${description.slice(0, 100)} | 칼로리 ${calory}, 단백질 ${protein}g`
    : `${name} 메뉴 정보와 주변 맛집을 확인하세요. 칼로리 ${calory}kcal`;

  // OG 이미지: 메뉴 이미지 또는 기본 이미지
  const ogImage = image_link || "/og/og-image.png";

  // 키워드: 메뉴명, 알레르기 정보, 기본 키워드
  const keywords = [
    name,
    "메뉴추천",
    "맛집",
    "오늘뭐먹지",
    ...(allergic || []),
  ];

  return {
    title, // 루트 layout의 template에 의해 " | 오메추" 자동 추가
    description: metaDescription,
    keywords,
    openGraph: {
      title,
      description: metaDescription,
      url: `${BASE_URL}${currentPath}`,
      siteName: "오메추",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: ogImage,
          width: image_link ? 800 : 1200,
          height: image_link ? 600 : 630,
          alt: `${name} 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${BASE_URL}${currentPath}`,
    },
  };
}

/**
 * Schema.org Recipe JSON-LD 생성
 * 구글 검색 리치 스니펫에 활용됨
 */
export function generateRecipeJsonLd(menuDetail: MenuDetail) {
  const { name, description, image_link, calory, protein, carbo, fat } =
    menuDetail;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description: description || `${name} 요리 정보`,
    image: image_link || undefined,
    nutrition: {
      "@type": "NutritionInformation",
      calories: calory ? `${calory} calories` : undefined,
      proteinContent: protein ? `${protein}g` : undefined,
      carbohydrateContent: carbo ? `${carbo}g` : undefined,
      fatContent: fat ? `${fat}g` : undefined,
    },
  };
}
