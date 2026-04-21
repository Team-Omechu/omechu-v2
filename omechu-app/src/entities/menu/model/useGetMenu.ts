import { useQuery } from "@tanstack/react-query";

import { getMenu } from "@/entities/menu/api/getMenu";
import {
  type MenuListResponse,
  type RecommendMenuRequest,
} from "@/entities/menu/config/resultData";

import { useQuestionAnswerStore } from "@/shared/store/questionAnswer.store";

const MENU_STALE_TIME_MS = 5 * 60 * 1000;

export function useGetMenu() {
  const { mealTime, purpose, mood, who, budget, exceptions } =
    useQuestionAnswerStore();

  const payload: RecommendMenuRequest = {
    동반자: who,
    식사목적: purpose,
    날씨: mood,
    언제: mealTime,
    예산: budget,
    제외음식: exceptions,
  };
  return useQuery<MenuListResponse>({
    queryKey: ["recommendMenu", payload],
    queryFn: () => getMenu(payload),
    staleTime: MENU_STALE_TIME_MS,
  });
}
