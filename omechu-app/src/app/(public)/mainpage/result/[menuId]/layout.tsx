import { Metadata } from "next";

import { generateSummaryMetadata } from "@/shared/lib/generateMenuMetadata";
import { fetchRecommendMenuForMetadata } from "@/shared/lib/metadataFetchers";

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

    const recommendResponse =
      await fetchRecommendMenuForMetadata(decodedMenuId);

    if (!recommendResponse || recommendResponse.results.length === 0) {
      return {
        title: "맞춤 추천 | 오메추",
        description: "오늘 뭐 먹지? 오메추에서 맞춤 메뉴를 추천받아보세요.",
        robots: { index: false, follow: true },
      };
    }

    const menuNames = recommendResponse.results.map((item) => item.menu);

    return generateSummaryMetadata(
      menuNames,
      "맞춤 추천",
      `/mainpage/result/${menuId}`,
    );
  } catch (error) {
    console.error("Failed to generate metadata:", error);

    return {
      title: "맞춤 추천 | 오메추",
      description: "오늘 뭐 먹지? 오메추에서 맞춤 메뉴를 추천받아보세요.",
      robots: { index: false, follow: true },
    };
  }
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
