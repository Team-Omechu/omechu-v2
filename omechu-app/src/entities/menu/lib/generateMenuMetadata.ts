import { type Metadata } from "next";

import { type MenuDetail } from "@/entities/menu/model/menu.types";

import { BASE_URL } from "@/shared/constants/url";

const MAX_DISPLAY_MENUS = 5;

export function generateMenuMetadata(
  menuDetail: MenuDetail | null,
  currentPath: string,
): Metadata {
  if (!menuDetail) {
    return {
      title: "오메추 | 오늘 뭐 먹지?",
      description:
        "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?",
      robots: { index: false, follow: true },
    };
  }

  const { name, image_link } = menuDetail;

  const title = `오메추 | 오늘의 메뉴는 [${name}]`;
  const metaDescription =
    "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?";
  const ogImage = image_link || "/og/og-image.png";

  return {
    title,
    description: metaDescription,
    keywords: [name, "메뉴추천", "맛집", "오늘뭐먹지"],
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

  const displayNames = menuNames.slice(0, MAX_DISPLAY_MENUS);
  const menuText = displayNames.join(", ");
  const title = `${menuText} ${pageType}`;

  const description =
    menuNames.length > MAX_DISPLAY_MENUS
      ? `${menuText} 외 ${menuNames.length - MAX_DISPLAY_MENUS}개 메뉴를 추천합니다.`
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
  menuName: string,
  imageLink: string | null,
  currentPath: string,
): Metadata {
  const title = `오메추 | 오늘의 메뉴는 [${menuName}]`;
  const description =
    "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?";
  const ogImage = imageLink || "/og/og-image.png";

  return {
    title,
    description,
    keywords: [menuName, "메뉴추천", "맛집", "오늘뭐먹지"],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${currentPath}`,
      siteName: "오메추",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: `${menuName} 이미지`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
