"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { handleLocation, useLocationAnswerStore } from "@/entities/location";
import { useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { useRecommendManagement } from "@/entities/user";
import { Header } from "@/shared";
import { StartButton } from "@/widgets/mainpage/ui/StartButton";

type Pick = "start" | "battle" | "random" | null;

export default function MainPage() {
  const router = useRouter();

  const { tagDataReset } = useTagStore();
  const { locationReset, setX, setY, setLocationDenied } =
    useLocationAnswerStore();

  const { questionReset, addException, resetExceptions } =
    useQuestionAnswerStore();

  const [picked, setPicked] = useState<Pick>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data, refetch } = useRecommendManagement();

  const resetAll = () => {
    tagDataReset();
    locationReset();
    questionReset();
    handleLocation(setX, setY, setLocationDenied);
  };

  const go = (next: string, pick: Exclude<Pick, null>) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setPicked(pick);

    window.setTimeout(() => {
      resetAll();
      router.push(next);
    }, 120);
  };

  // 1) "이 페이지로 돌아왔을 때" API를 다시 치게 만들기
  useEffect(() => {
    const runRefetch = () => {
      // refetch는 Promise 반환하지만 여기서는 fire-and-forget
      void refetch();
    };

    // BFCache(뒤로가기 복원)까지 커버
    const onPageShow = () => runRefetch();
    // 포커스 복귀 시점 커버
    const onFocus = () => runRefetch();

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);

    // 최초 진입 시에도 한 번 갱신하고 싶으면 아래 한 줄 유지
    runRefetch();

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetch]);

  //2) 응답에서 exceptedMenus.name만 뽑아서 addException에 넣기
  useEffect(() => {
    const exceptedMenus = data?.exceptedMenus;
    if (!Array.isArray(exceptedMenus)) return;

    // 서버 제외목록이 "갱신"되는 걸 정확히 반영하려면:
    // 기존 exceptions를 한번 비우고 최신 목록으로 다시 채우는 게 안전
    resetExceptions();

    for (const m of exceptedMenus) {
      if (m && typeof m.name === "string" && m.name.trim().length > 0) {
        addException(m.name.trim());
      }
    }
  }, [data, addException, resetExceptions]);

  return (
    <div className="scrollbar-hide relative flex h-screen w-full justify-center overflow-hidden bg-linear-to-b from-pink-200 to-purple-300">
      <Header variant="mypage" className="absolute top-0 left-0 z-20" />

      <div className="pointer-events-none absolute inset-0 bg-black/65" />

      <div className="relative mx-auto w-full max-w-md lg:max-w-lg xl:max-w-xl">
        <Image
          src="/mainpage/mainpage.svg"
          alt="메인 페이지"
          fill
          style={{ objectFit: "cover" }}
          className="object-cover lg:object-contain"
        />
      </div>

      <div className="absolute top-[45%] left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-5">
        <Image
          src="/logo/logo.svg"
          alt="메인 로고"
          width={260}
          height={170}
          className="flex justify-center"
        />

        <section className="mt-10 flex flex-col gap-5">
          <StartButton
            title="맞춤 추천"
            subTitle="바로 지금, 나만을 위한 메뉴는?"
            selected={picked === "start"}
            dimmed={picked !== null && picked !== "start"}
            onClick={() => go("/mainpage/question-answer/1", "start")}
          />
          <StartButton
            title="메뉴 배틀"
            subTitle="오늘의 메뉴, 배틀로 정하자"
            selected={picked === "battle"}
            dimmed={picked !== null && picked !== "battle"}
            onClick={() => go("/menu-battle", "battle")}
          />
          <StartButton
            title="랜덤 추천"
            subTitle="클릭 한 번으로 바로 결정!"
            selected={picked === "random"}
            dimmed={picked !== null && picked !== "random"}
            onClick={() => go("/random-recommend", "random")}
          />
        </section>
      </div>
    </div>
  );
}
