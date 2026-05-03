import type {
  MenuListResponse,
  RandomMenu,
} from "@/entities/menu/config/resultData";
import { type MenuDetail } from "@/entities/menu/model/menu.types";

import { createClient } from "@/shared/lib/supabase/server";

interface MenuRow {
  id: number;
  name: string;
  description: string | null;
  calory: number | null;
  carbo: number | null;
  protein: number | null;
  fat: number | null;
  sodium: number | null;
  image_link: string | null;
}

export async function fetchMenuDetailForMetadata(
  menuName: string,
): Promise<MenuDetail | null> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("menu")
      .select(
        "id, name, description, calory, carbo, protein, fat, sodium, image_link",
      )
      .eq("name", menuName.trim())
      .limit(1)
      .maybeSingle<MenuRow>();
    if (error || !data) return null;
    return {
      name: data.name,
      description: data.description ?? "",
      calory: data.calory?.toString() ?? "",
      carbo: data.carbo?.toString() ?? "",
      protein: data.protein?.toString() ?? "",
      fat: data.fat?.toString() ?? "",
      sodium: data.sodium?.toString() ?? "",
      vitamin: [],
      allergic: [],
      image_link: data.image_link,
      recipe_link: null,
      recipe_link_source: null,
      recipe_video_name: null,
    };
  } catch (error) {
    console.error("Failed to fetch menu detail:", error);
    return null;
  }
}

export async function fetchRandomMenuForMetadata(
  menuName: string,
): Promise<RandomMenu | null> {
  // menuName 자체를 seed로 쓰지 않고 단순히 해당 메뉴 정보를 반환.
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("menu")
      .select("name, image_link")
      .eq("name", menuName.trim())
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      name: data.name as string,
      image_link: (data.image_link as string | null) ?? "",
    };
  } catch (error) {
    console.error("Failed to fetch random menu:", error);
    return null;
  }
}

export async function fetchRecommendMenuForMetadata(
  menuName: string,
): Promise<MenuListResponse | null> {
  // 본래 ML embed 서버가 담당. 현재는 동일 메뉴를 단일 결과로 포장.
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from("menu")
      .select("name, description, image_link")
      .eq("name", menuName.trim())
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      query_text: menuName,
      results: [
        {
          menu: data.name as string,
          text: (data.description as string | null) ?? "",
          image_link: (data.image_link as string | null) ?? "",
          allergens: [],
        },
      ],
    };
  } catch (error) {
    console.error("Failed to fetch recommend menu:", error);
    return null;
  }
}
