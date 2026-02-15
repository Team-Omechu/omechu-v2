import { Metadata } from "next";

import {
  generateMenuMetadata,
  generateMinimalMetadata,
} from "@/shared/lib/generateMenuMetadata";
import {
  fetchBattleWinnerForMetadata,
  fetchMenuDetailForMetadata,
} from "@/shared/lib/metadataFetchers";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  try {
    const { id: battleId } = await params;

    const winner = await fetchBattleWinnerForMetadata(battleId);

    if (!winner) {
      return {
        title: "오메추 | 메뉴 배틀",
        description:
          "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?",
      };
    }

    const menuDetail = await fetchMenuDetailForMetadata(winner.menuName);

    if (menuDetail) {
      return generateMenuMetadata(menuDetail, `/menu-battle/play/${battleId}`);
    }

    return generateMinimalMetadata(
      winner.menuName,
      winner.imageLink,
      `/menu-battle/play/${battleId}`,
    );
  } catch (error) {
    console.error("Failed to generate metadata:", error);

    return {
      title: "오메추 | 메뉴 배틀",
      description:
        "취향에 딱 맞는 메뉴를 추천 받았어요! 오늘 식사는 이 메뉴로 정해볼까요?",
    };
  }
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
