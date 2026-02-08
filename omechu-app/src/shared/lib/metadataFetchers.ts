import type { RandomMenu, MenuListResponse } from "@/entities/menu";
import { MenuDetail } from "@/shared/config/menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://omechu-api.log8.kr";

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
    const response = await fetch("https://embed.log8.kr/recommend/menu", {
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
