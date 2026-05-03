// TODO(recommend-engine): 본래 ML embed 서버가 담당했던 개인화 추천.
// 현재는 Supabase `recommend_random` RPC(태그 필터 + 유저 알러지/제외 반영)로 대체.
// 질문 응답(분위기/예산/동반자)은 반영 못함. 자체 추천 엔진 도입 시 교체.
import {
  type MenuListResponse,
  type RecommendMenuRequest,
} from "@/entities/menu/config/resultData";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface MenuRow {
  id: number;
  name: string;
  description: string | null;
  image_link: string | null;
}

const PREFER_TO_TAG: Record<string, string> = {
  한식: "korean",
  양식: "western",
  중식: "chinese",
  일식: "japanese",
  다른나라: "other",
};

export const getMenu = async (
  request: RecommendMenuRequest,
): Promise<MenuListResponse> => {
  const sb = createSupabaseBrowserClient();

  const preferTag = request.선호음식
    ? PREFER_TO_TAG[request.선호음식]
    : undefined;
  const tags = preferTag ? [preferTag] : null;

  const { data, error } = await sb.rpc("recommend_random", {
    tags,
    limit_count: 10,
  });
  if (error) throw error;

  const rows = (data ?? []) as MenuRow[];

  return {
    query_text: request.선호음식 ?? "",
    results: rows.map((m) => ({
      menu: m.name,
      text: m.description ?? "",
      image_link: m.image_link ?? "",
      allergens: [],
    })),
  };
};
