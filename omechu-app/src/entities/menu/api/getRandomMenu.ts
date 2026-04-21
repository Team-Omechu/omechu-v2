// TODO(supabase-migration): `menu` 테이블 + 필터(prefer/allergy) 랜덤 RPC로 이전 필요.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import {
  type RandomMenu,
  type RandomMenuRequest,
} from "@/entities/menu/config/resultData";

import { axiosInstance } from "@/shared";

export const getRandomMenu = async (
  request: RandomMenuRequest,
): Promise<RandomMenu> => {
  // POST 로 body 에 실어서 보내기
  const { data } = await axiosInstance.post<RandomMenu>(
    "/menu/recommend/random",
    request,
  );
  return data;
};
