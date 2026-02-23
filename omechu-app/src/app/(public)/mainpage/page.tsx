"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { handleLocation, useLocationAnswerStore } from "@/entities/location";
import { useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { Header } from "@/shared";
import { StartButton } from "@/widgets/mainpage/ui/StartButton";

type Pick = "start" | "battle" | "random" | null;

export default function MainPage() {
  const router = useRouter();
  const { tagDataReset } = useTagStore();
  const { locationReset, setX, setY, setLocationDenied } =
    useLocationAnswerStore();
  const { questionReset } = useQuestionAnswerStore();
  const [picked, setPicked] = useState<Pick>(null);
  const [isNavigating, setIsNavigating] = useState(false);

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

  return (
    <div className="scrollbar-hide relative flex h-screen w-full justify-center overflow-hidden bg-linear-to-b from-pink-200 to-purple-300">
      {/* ✅ 헤더: 마이페이지 아이콘만 */}
      <Header variant="mypage" className="absolute top-0 left-0 z-20" />

      {/* 어두운 오버레이 */}
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

      {/* 버튼 */}
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
