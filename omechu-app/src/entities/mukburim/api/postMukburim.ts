// TODO(supabase-migration): `user_meal_log` insert로 이전 필요.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import { type mukburimResponse } from "@/entities/mukburim/config/mukburim";

import { axiosInstance } from "@/shared";

export const postMukburim = async (
  menuName: string,
): Promise<mukburimResponse> => {
  const { data } = await axiosInstance.post<mukburimResponse>(
    "/menu/mukburim",
    {
      menu_name: menuName,
    },
  );
  return data;
};
