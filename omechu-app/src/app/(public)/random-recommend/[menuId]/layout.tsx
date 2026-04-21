import { type Metadata } from "next";
import { cache } from "react";

import {
  fetchMenuDetailForMetadata,
  generateMenuMetadata,
  generateMinimalMetadata,
  generateRecipeJsonLd,
} from "@/entities/menu";

const getCachedMenuDetail = cache(fetchMenuDetailForMetadata);

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

    const menuDetail = await getCachedMenuDetail(decodedMenuId);

    if (menuDetail) {
      return generateMenuMetadata(menuDetail, `/random-recommend/${menuId}`);
    }

    return generateMinimalMetadata(
      decodedMenuId,
      null,
      `/random-recommend/${menuId}`,
    );
  } catch (error) {
    console.error("Failed to generate metadata:", error);

    return {
      title: "오메추 | 오늘 뭐 먹지?",
      description:
        "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?",
      robots: { index: false, follow: true },
    };
  }
}

export default async function Layout({ children, params }: LayoutProps) {
  let jsonLd = null;

  try {
    const { menuId } = await params;
    const decodedMenuId = decodeURIComponent(menuId);

    const menuDetail = await getCachedMenuDetail(decodedMenuId);

    if (menuDetail) {
      jsonLd = generateRecipeJsonLd(menuDetail);
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
