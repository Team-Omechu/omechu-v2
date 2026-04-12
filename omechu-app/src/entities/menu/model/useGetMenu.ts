import { useQuestionAnswerStore } from "@/shared/store/questionAnswer.store";
import { whoOptions } from "@/shared/config/questionOptions";
import { useQuery } from "@tanstack/react-query";
import {
  MenuListResponse,
  RecommendMenuRequest,
} from "@/entities/menu/config/resultData";
import { getMenu } from "@/entities/menu/api/getMenu";

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
    staleTime: 1000 * 60 * 5,
  });
}
