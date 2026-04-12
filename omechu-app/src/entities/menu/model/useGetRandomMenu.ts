import { useQuery } from "@tanstack/react-query";

import { getRandomMenu } from "@/entities/menu/api/getRandomMenu";
import type { RandomMenu } from "@/entities/menu/config/resultData";
import { useQuestionAnswerStore } from "@/shared/store/questionAnswer.store";

export function useGetRandomMenu() {
  const { addition } = useQuestionAnswerStore();

  const payload = {
    addition: addition.length > 0 ? addition : null,
  };

  return useQuery<RandomMenu>({
    //addition을 queryKey에 포함 (추가조건 바뀌면 다른 캐시로 취급)
    queryKey: ["randomMenu", payload.addition],

    queryFn: () => getRandomMenu(payload),
    staleTime: 0,

    //모달 다시 열 때마다 무조건 새 요청
    refetchOnMount: "always",

    //닫는 순간 언마운트되면 캐시를 바로 버리게(=같은 메뉴 재등장 방지)
    gcTime: 0,

    // 포커스 이동 때 랜덤이 바뀌는 걸 원치 않으면 꺼두기
    refetchOnWindowFocus: false,
  });
}
