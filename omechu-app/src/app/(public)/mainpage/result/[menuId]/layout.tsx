import { type Metadata } from "next";
import Script from "next/script";

import {
  generateMenuMetadata,
  generateRecipeJsonLd,
} from "@/shared/lib/generateMenuMetadata";
import { fetchMenuDetailForMetadata } from "@/shared/lib/metadataFetchers";

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

    const menuDetail = await fetchMenuDetailForMetadata(decodedMenuId);

    return generateMenuMetadata(menuDetail, `/mainpage/result/${menuId}`);
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
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const { menuId } = await params;
    const decodedMenuId = decodeURIComponent(menuId);
    const menuDetail = await fetchMenuDetailForMetadata(decodedMenuId);

    if (menuDetail) {
      jsonLd = generateRecipeJsonLd(menuDetail);
    }
  } catch (error) {
    console.error("Failed to generate JSON-LD:", error);
  }

  return (
    <>
      {jsonLd && (
        <Script id="mainpage-result-jsonld" type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>
      )}
      {children}
    </>
  );
}
