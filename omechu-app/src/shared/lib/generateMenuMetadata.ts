import { Metadata } from "next";

import { MenuDetail } from "@/shared/config/menu";
import { BASE_URL } from "@/shared/constants/url";

export function generateMenuMetadata(
  menuDetail: MenuDetail | null,
  pageType: "랜덤 추천" | "맞춤 추천",
  currentPath: string,
): Metadata {
  if (!menuDetail) {
    return {
      title: `${pageType} | 오메추`,
      description: "오늘 뭐 먹지? 오메추에서 메뉴를 추천받아보세요.",
      robots: { index: false, follow: true },
    };
  }

  const { name, description, image_link, allergic, calory, protein } =
    menuDetail;

  const title = `${name} ${pageType}`;

  const metaDescription = description
    ? `${description.slice(0, 100)} | 칼로리 ${calory}, 단백질 ${protein}g`
    : `${name} 메뉴 정보와 주변 맛집을 확인하세요. 칼로리 ${calory}kcal`;

  const ogImage = image_link || "/og/og-image.png";

  const keywords = [
    name,
    "메뉴추천",
    "맛집",
    "오늘뭐먹지",
    ...(allergic || []),
  ];

  return {
    title,
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

export function generateSummaryMetadata(
  menuNames: string[],
  pageType: "랜덤 추천" | "맞춤 추천",
  currentPath: string,
): Metadata {
  if (menuNames.length === 0) {
    return {
      title: `${pageType} | 오메추`,
      description: "오늘 뭐 먹지? 오메추에서 메뉴를 추천받아보세요.",
      robots: { index: false, follow: true },
    };
  }

  const displayNames = menuNames.slice(0, 5);
  const menuText = displayNames.join(", ");
  const title = `${menuText} ${pageType}`;

  const description =
    menuNames.length > 5
      ? `${menuText} 외 ${menuNames.length - 5}개 메뉴를 추천합니다.`
      : `${menuText} 메뉴를 추천합니다.`;

  return {
    title,
    description,
    keywords: [...menuNames, "메뉴추천", "맛집", "오늘뭐먹지"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${currentPath}`,
      siteName: "오메추",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: "/og/og-image.png",
          width: 1200,
          height: 630,
          alt: "오메추 메뉴 추천",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/og-image.png"],
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

export function generateMinimalMetadata(
  randomMenu: { name: string; image_link: string | null },
  pageType: "랜덤 추천",
  currentPath: string,
): Metadata {
  const { name, image_link } = randomMenu;
  const title = `${name} ${pageType}`;
  const description = `${name} 메뉴를 추천받아보세요.`;

  return {
    title,
    description,
    keywords: [name, "메뉴추천", "맛집", "오늘뭐먹지"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${currentPath}`,
      siteName: "오메추",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: image_link || "/og/og-image.png",
          width: 800,
          height: 600,
          alt: `${name} 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image_link || "/og/og-image.png"],
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
