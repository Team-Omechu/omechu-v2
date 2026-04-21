// TODO(supabase-migration):
// - fetchMenuDetailForMetadata / fetchRandomMenuForMetadata → Supabase `menu` 테이블 조회
// - fetchRecommendMenuForMetadata → embed(ML) 서버 대체 전략 필요 (자체 Edge Function 등)
// 현재 NEXT_PUBLIC_API_URL / NEXT_PUBLIC_EMBED_API_URL 의존 — 백엔드 부재로 항상 null 반환.
import type {
  MenuListResponse,
  RandomMenu,
} from "@/entities/menu/config/resultData";
import { type MenuDetail } from "@/entities/menu/model/menu.types";

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
