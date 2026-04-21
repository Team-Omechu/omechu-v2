// TODO(supabase-migration): `menu_battle` 테이블 조회로 이전 필요.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 항상 null 반환.
import type { BattleResponse } from "@/entities/menu-battle/model/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type BattleWinnerMenu = {
  menuName: string;
  imageLink: string | null;
};

function isBattleResponse(data: unknown): data is BattleResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "spinResults" in data &&
    "menus" in data &&
    Array.isArray((data as BattleResponse).spinResults) &&
    Array.isArray((data as BattleResponse).menus)
  );
}

export async function fetchBattleWinnerForMetadata(
  battleId: string,
): Promise<BattleWinnerMenu | null> {
  try {
    const response = await fetch(`${API_URL}/menu/battles/${battleId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const raw: unknown = await response.json();
    let battle: BattleResponse | null = null;

    if (
      typeof raw === "object" &&
      raw !== null &&
      "resultType" in raw &&
      "success" in raw
    ) {
      const wrapped = raw as { success: unknown };
      if (isBattleResponse(wrapped.success)) {
        battle = wrapped.success;
      }
    } else if (isBattleResponse(raw)) {
      battle = raw;
    }

    if (!battle) return null;

    if (battle.status !== "finished" || battle.spinResults.length === 0) {
      return null;
    }

    const winner = battle.spinResults.find((r) => r.rank === 1);
    if (!winner) return null;

    const winnerMenu = battle.menus.find(
      (m) => m.menuName === winner.closestMenuName,
    );

    return {
      menuName: winner.closestMenuName,
      imageLink: winnerMenu?.imageLink ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch battle data:", error);
    return null;
  }
}
