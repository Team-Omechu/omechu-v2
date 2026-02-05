"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/entities/onboarding";
import { Toast, useToast } from "@/shared";
import { ALLERGY_OPTIONS } from "@/shared/constants/mypage";
import {
  BaseModal,
  BottomButton,
  Header,
  ModalWrapper,
  OnboardingButton,
  ProgressBar,
} from "@/shared/index";

const allergyValueToLabel = ALLERGY_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  },
  {} as Record<string, string>,
);

interface BasicAllergyFormProps {
  onCancel: () => void;
  onSave: () => Promise<void>;
}

export function BasicAllergyForm({ onCancel, onSave }: BasicAllergyFormProps) {
  const router = useRouter();
  const { allergy, toggleAllergy } = useOnboardingStore();
  const [showCancleModal, setShowCancleModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { show: showToast, message: toastMessage, triggerToast } = useToast();

  const handleSave = async () => {
    try {
      await onSave();
      setShowSaveModal(true);
    } catch (error) {
      console.error("저장 실패:", error);
      triggerToast("저장에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <Header
        title="기본 상태 입력"
        onBackClick={() => setShowCancleModal(true)}
        showHomeButton={false}
      />
      <ProgressBar currentStep={3} totalSteps={3} className="mt-1" />
      <section className="relative flex min-h-[89dvh] flex-col items-center">
        <h1 className="text-foundation-grey-darker mt-12 text-center text-[28px] font-medium whitespace-pre-line">
          알레르기가 있나요?
        </h1>
        <div className="mt-12 h-fit w-63.5">
          <div className="grid grid-cols-3 gap-4">
            {ALLERGY_OPTIONS.slice(0, -2).map(({ label, value }, idx) => (
              <div key={idx}>
                <OnboardingButton
                  selected={allergy.includes(allergyValueToLabel[value])}
                  width="xs"
                  onClick={() => toggleAllergy(allergyValueToLabel[value])}
                >
                  {label}
                </OnboardingButton>
              </div>
            ))}
          </div>
          <div className="mt-4 mb-20 grid grid-cols-2 gap-4">
            {ALLERGY_OPTIONS.slice(-2).map(({ label, value }, idx) => {
              const actualIdx = ALLERGY_OPTIONS.length - 2 + idx;
              return (
                <div key={actualIdx}>
                  <OnboardingButton
                    selected={allergy.includes(allergyValueToLabel[value])}
                    width="sm"
                    onClick={() => toggleAllergy(allergyValueToLabel[value])}
                  >
                    {label}
                  </OnboardingButton>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <BottomButton disabled={allergy.length === 0} onClick={handleSave}>
        저장
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

      {showSaveModal && (
        <ModalWrapper>
          <BaseModal
            title="저장 완료!"
            desc="이제 맛있는 메뉴 추천을 받아볼까요?"
            leftButtonText="내 정보 보기"
            rightButtonText="추천 보기"
            onCloseClick={() => setShowSaveModal(false)}
            onLeftButtonClick={() => router.push("/mypage")}
            onRightButtonClick={() => {
              setShowSaveModal(false);
              router.push("/mainpage");
            }}
          />
        </ModalWrapper>
      )}

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </>
  );
}
