"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useOnboardingStore } from "@/entities/onboarding";

import { STATE_OPTIONS } from "@/shared/constants/mypage";

import {
  BaseModal,
  BottomButton,
  Button,
  Header,
  ModalWrapper,
  ProgressBar,
} from "@/shared";

const exerciseValueToLabel = {
  diet: "다이어트 중",
  bulk: "증량 중",
  maintain: "유지 중",
} as const;

interface BasicStateFormProps {
  cancelHref: string;
}

export function BasicStateForm({ cancelHref }: BasicStateFormProps) {
  const router = useRouter();
  const { exercise, setExercise } = useOnboardingStore();
  const [showCancleModal, setShowCancleModal] = useState(false);

  const selectedIndex = exercise
    ? STATE_OPTIONS.findIndex(
        (opt) => exerciseValueToLabel[opt.value] === exercise,
      )
    : null;

  return (
    <>
      <Header
        title="기본 상태 입력"
        onBackClick={() => setShowCancleModal(true)}
        showHomeButton={false}
      />
      <ProgressBar currentStep={1} totalSteps={3} className="mt-1" />
      <section className="relative flex min-h-[89dvh] flex-col items-center">
        <h1 className="text-foundation-grey-darker mt-16 text-center text-[28px] font-medium whitespace-pre-line">{`지금 어떤 운동 상태에 \n 가까운가요?`}</h1>
        <div className="mt-20 flex flex-col gap-4">
          {STATE_OPTIONS.map(({ label, value }, idx) => (
            <Button
              key={idx}
              selected={selectedIndex === idx}
              onClick={() => setExercise(exerciseValueToLabel[value] ?? value)}
              height="md"
              radius="sm"
              className="text-body-2-regular w-[246px]"
            >
              {label}
            </Button>
          ))}
        </div>
      </section>
      <BottomButton
        disabled={selectedIndex === null}
        onClick={() => router.push("food")}
      >
        다음
      </BottomButton>
      {showCancleModal && (
        <ModalWrapper>
          <BaseModal
            title="기본 상태 입력을 중단하시겠어요?"
            desc="지금까지 작성한 내용은 저장되지 않아요."
            isCloseButtonShow={false}
            leftButtonText="그만하기"
            rightButtonText="계속하기"
            onLeftButtonClick={() => router.push(cancelHref)}
            onRightButtonClick={() => setShowCancleModal(false)}
          />
        </ModalWrapper>
      )}
    </>
  );
}
