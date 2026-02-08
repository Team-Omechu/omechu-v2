import { Metadata } from "next";

import {
  fetchMenuDetailForMetadata,
  fetchRandomMenuForMetadata,
} from "@/shared/lib/metadataFetchers";
import {
  generateMenuMetadata,
  generateMinimalMetadata,
  generateRecipeJsonLd,
} from "@/shared/lib/generateMenuMetadata";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ menuId: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  try {
    const { menuId } = await params;
    const decodedMenuId = decodeURIComponent(menuId);

    const randomMenu = await fetchRandomMenuForMetadata(decodedMenuId);

    if (!randomMenu) {
      return {
        title: "랜덤 추천 | 오메추",
        description: "오늘 뭐 먹지? 오메추에서 랜덤 메뉴를 추천받아보세요.",
        robots: { index: false, follow: true },
      };
    }

    const menuDetail = await fetchMenuDetailForMetadata(randomMenu.name);

    if (menuDetail) {
      return generateMenuMetadata(
        menuDetail,
        "랜덤 추천",
        `/random-recommend/${menuId}`,
      );
    } else {
      return generateMinimalMetadata(
        randomMenu,
        "랜덤 추천",
        `/random-recommend/${menuId}`,
      );
    }
  } catch (error) {
    console.error("Failed to generate metadata:", error);

    return {
      title: "랜덤 추천 | 오메추",
      description: "오늘 뭐 먹지? 오메추에서 랜덤 메뉴를 추천받아보세요.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function Layout({ children, params }: LayoutProps) {
  let jsonLd = null;

  try {
    const { menuId } = await params;
    const decodedMenuId = decodeURIComponent(menuId);

    const randomMenu = await fetchRandomMenuForMetadata(decodedMenuId);

    if (randomMenu) {
      const menuDetail = await fetchMenuDetailForMetadata(randomMenu.name);

      if (menuDetail) {
        jsonLd = generateRecipeJsonLd(menuDetail);
      }
    }
  } catch (error) {
    console.error("Failed to generate JSON-LD:", error);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
