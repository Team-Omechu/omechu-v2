"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/entities/onboarding";
import { FOOD_OPTIONS } from "@/shared/constants/mypage";
import {
  BaseModal,
  BottomButton,
  Header,
  ModalWrapper,
  OnboardingButton,
  ProgressBar,
} from "@/shared/index";

const foodValueToLabel: Record<string, string> = {
  korean: "한식",
  western: "양식",
  chinese: "중식",
  japanese: "일식",
  other: "다른나라",
};

interface BasicFoodFormProps {
  onCancel: () => void;
}

export function BasicFoodForm({ onCancel }: BasicFoodFormProps) {
  const router = useRouter();
  const { prefer, togglePrefer } = useOnboardingStore();
  const [showCancleModal, setShowCancleModal] = useState(false);

  const selectedIndexes = FOOD_OPTIONS.map((opt, idx) =>
    prefer.includes(foodValueToLabel[opt.value]) ? idx : -1,
  ).filter((idx) => idx !== -1);

  return (
    <>
      <Header
        title="기본 상태 입력"
        onBackClick={() => setShowCancleModal(true)}
        showHomeButton={false}
      />
      <ProgressBar currentStep={2} totalSteps={3} className="mt-1" />
      <section className="relative flex min-h-[89dvh] flex-col items-center">
        <h1 className="text-foundation-grey-darker mt-16 text-center text-[28px] font-medium whitespace-pre-line">{`평소 자주 먹거나 좋아하는 \n 음식이 있나요?`}</h1>
        <div className="mt-20 flex flex-col gap-4">
          {FOOD_OPTIONS.map(({ label, value }, idx) => (
            <OnboardingButton
              key={idx}
              selected={selectedIndexes.includes(idx)}
              onClick={() => togglePrefer(foodValueToLabel[value])}
            >
              {label}
            </OnboardingButton>
          ))}
        </div>
      </section>
      <BottomButton
        disabled={selectedIndexes.length === 0}
        onClick={() => router.push("allergy")}
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
            onLeftButtonClick={onCancel}
            onRightButtonClick={() => setShowCancleModal(false)}
          />
        </ModalWrapper>
      )}
    </>
  );
}
