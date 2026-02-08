import { Metadata } from "next";

import { MenuDetail } from "@/shared/config/menu";
import {
  generateMenuMetadata,
  generateRecipeJsonLd,
} from "@/shared/lib/generateMenuMetadata";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ menuId: string }>;
}

async function fetchMenuDetail(name: string): Promise<MenuDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }

    const response = await fetch(`${apiUrl}/menu/menu-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
      cache: "no-store", // 항상 최신 데이터 조회
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch menu detail:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  try {
    const { menuId } = await params;
    const decodedMenuId = decodeURIComponent(menuId);
    const menuDetail = await fetchMenuDetail(decodedMenuId);

    return generateMenuMetadata(
      menuDetail,
      "랜덤 추천",
      `/random-recommend/${menuId}`,
    );
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
    const menuDetail = await fetchMenuDetail(decodedMenuId);

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
