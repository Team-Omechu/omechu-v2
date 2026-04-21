import { type MenuDetail } from "@/shared/config/menu";
import type { BattleResponse } from "@/shared/types/battle";
import type { MenuListResponse, RandomMenu } from "@/shared/types/menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const EMBED_API_URL = process.env.NEXT_PUBLIC_EMBED_API_URL;

export async function fetchMenuDetailForMetadata(
  menuName: string,
): Promise<MenuDetail | null> {
  try {
    const response = await fetch(`${API_URL}/menu/menu-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: menuName.trim() }),
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;
    const data: MenuDetail = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch menu detail:", error);
    return null;
  }
}

export async function fetchRandomMenuForMetadata(
  menuName: string,
): Promise<RandomMenu | null> {
  try {
    const response = await fetch(`${API_URL}/menu/recommend/random`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: menuName.trim() }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const data: RandomMenu = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch random menu:", error);
    return null;
  }
}

export async function fetchRecommendMenuForMetadata(
  menuName: string,
): Promise<MenuListResponse | null> {
  try {
    const response = await fetch(`${EMBED_API_URL}/recommend/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: menuName.trim() }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;
    const data: MenuListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch recommend menu:", error);
    return null;
  }
}

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
