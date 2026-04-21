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
