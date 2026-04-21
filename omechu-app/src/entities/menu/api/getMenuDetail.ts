// TODO(supabase-migration): `menu` 테이블 시드 + 조회로 이전 필요.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import { type MenuDetail } from "@/entities/menu/model/menu.types";

import { axiosInstance } from "@/shared";

export const getMenuDetail = async (
  name: string,
  opts?: { signal?: AbortSignal },
): Promise<MenuDetail> => {
  if (!name) throw new Error("menu name is required");

  const res = await axiosInstance.post<MenuDetail>(
    "/menu/menu-info",
    { name: name.trim() },
    {
      headers: { "Content-Type": "application/json" },
      signal: opts?.signal,
    },
  );
  return res.data;
};
