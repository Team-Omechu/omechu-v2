import axios from "axios";

import {
  MenuListResponse,
  RecommendMenuRequest,
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
