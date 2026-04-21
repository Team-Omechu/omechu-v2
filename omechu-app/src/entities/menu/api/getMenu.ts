// TODO(supabase-migration): ML 추천 embed 서버 의존. Supabase 기반 대체 전략 필요
// (자체 Edge Function + 자체 추천 로직, 또는 Vercel AI SDK 등). 백엔드 부재로 동작하지 않음.
import axios from "axios";

import {
  type MenuListResponse,
  type RecommendMenuRequest,
} from "@/entities/menu/config/resultData";

const BASE_URL = process.env.NEXT_PUBLIC_EMBED_API_URL ?? "";

// BASE_URL + path를 안전하게 합치기
function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

export const getMenu = async (
  request: RecommendMenuRequest,
): Promise<MenuListResponse> => {
  const url = joinUrl(BASE_URL, "recommend/menu");

  const { data } = await axios.post<MenuListResponse>(url, request);
  return data;
};
