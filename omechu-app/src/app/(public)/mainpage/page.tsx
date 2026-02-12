"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { handleLocation, useLocationAnswerStore } from "@/entities/location";
import { useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { BaseModal, ModalWrapper } from "@/shared";
import { usePwaEntryModal } from "@/shared/lib/usePwaEntryModal";
import { StartButton } from "@/widgets/mainpage/ui/StartButton";

type Pick = "start" | "battle" | "random" | null;

export default function MainPage() {
  const router = useRouter();
  const { tagDataReset } = useTagStore();
  const { locationReset, setX, setY } = useLocationAnswerStore();
  const { questionReset } = useQuestionAnswerStore();

  const { open, skip, agree } = usePwaEntryModal();
  const [picked, setPicked] = useState<Pick>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const resetAll = () => {
    tagDataReset();
    locationReset();
    questionReset();
    handleLocation(setX, setY);
  };

  const go = (next: string, pick: Exclude<Pick, null>) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setPicked(pick);

    // 선택 효과(커짐/보더/투명) 잠깐 보여준 뒤 이동
    window.setTimeout(() => {
      resetAll();
      router.push(next);
    }, 120);
  };

  return (
    <div className="scrollbar-hide relative flex h-screen w-full justify-center overflow-hidden bg-linear-to-b from-pink-200 to-purple-300">
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

      {/* 버튼이 오버레이 위로 올라오게 */}
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
      {open && (
        <ModalWrapper>
          <BaseModal
            isLogoShow
            isCloseButtonShow={false}
            title={`“오늘 뭐 먹지” 고민, 끝내드릴게요`}
            desc={`식사 시간에 맞춰 딱 맞는 메뉴를 추천받을 수 있도록\n림을 보내드릴게요.\n\n* 광고성 정보 수신 동의가 포함되며, 마이페이지에서\n언제든지 변경할 수 있습니다.`}
            leftButtonText="다음에요"
            rightButtonText="동의하기"
            onLeftButtonClick={skip}
            onRightButtonClick={agree}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
