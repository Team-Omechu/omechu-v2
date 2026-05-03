"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  BudgetStep,
  MealTimeStep,
  MoodStep,
  PurposeStep,
  WhoStep,
} from "@/widgets/step";

import { useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import {
  BaseModal,
  Header,
  ModalWrapper,
  PaginationButton,
  ProgressBar,
} from "@/shared";

const QUESTION_STEPS = 5;
const RESULT_PATH = "/mainpage/result";

export default function QuestionAnswerPage() {
  const router = useRouter();
  const params = useParams();

  const store = useQuestionAnswerStore();
  const { setCurrentStep, questionReset, currentStep, clearStepValue } = store;
  const { clearStepTag } = useTagStore();

  const [showModal, setShowModal] = useState(false);

  const stepParam = params.step as string | undefined;

  const isResult = stepParam === "result";

  const step = useMemo(() => {
    if (!stepParam || isResult) return NaN;
    return Number(stepParam);
  }, [stepParam, isResult]);

  const handleConfirm = () => {
    questionReset();
    router.push("/mainpage");
    setShowModal(false);
  };

  useEffect(() => {
    // result 페이지면 step 세팅 불필요(원하면 setCurrentStep(QUESTION_STEPS) 같은 걸로 유지해도 됨)
    if (isResult) return;

    if (Number.isNaN(step) || step < 1 || step > QUESTION_STEPS) {
      router.replace("/mainpage/question-answer/1");
      return;
    }
    setCurrentStep(step);
  }, [isResult, step, router, setCurrentStep]);

  const handlePrev = () => {
    if (!isQuestionStep) return;
    if (step <= 1) return;

    //이전 step으로 이동(히스토리 의존 X)
    router.push(`/mainpage/question-answer/${step - 1}`);
  };

  const handleNext = () => {
    // 1~4 -> 다음 step
    // 5 -> result
    if (step >= 1 && step < QUESTION_STEPS) {
      //지금 step의 값 지우고
      clearStepValue(step);
      clearStepTag(step);
      router.push(`/mainpage/question-answer/${step + 1}`);
      return;
    }
    if (step === QUESTION_STEPS) {
      //지금 step의 값 지우고
      clearStepValue(step);
      clearStepTag(step);
      router.push(RESULT_PATH);
    }
  };

  const renderStepComponent = () => {
    if (isResult) return null;

    switch (step) {
      case 1:
        return <MealTimeStep />;
      case 2:
        return <PurposeStep />;
      case 3:
        return <MoodStep />;
      case 4:
        return <WhoStep />;
      case 5:
        return <BudgetStep />;
      default:
        return null;
    }
  };

  const isQuestionStep = !isResult && step >= 1 && step <= QUESTION_STEPS; // 1~5
  const showPrev = isQuestionStep && step > 1; // 2~5
  const showNext = isQuestionStep; // 1~5 (5면 result로 이동)

  return (
    <div className="relative flex min-h-dvh w-auto flex-col">
      {/* header: 질문 스텝에서만 표시 */}
      <Header
        title="맞춤 추천"
        showBackButton={false}
        homeModalTitle="메뉴 추천을 중단하시겠어요?"
        homeModalLeftText="그만하기"
        homeModalRightText="계속하기"
      />
      <ProgressBar currentStep={currentStep} totalSteps={5} />

      <main className="flex min-h-[calc(100vh-9rem)] w-full flex-col items-center px-4 py-6">
        {renderStepComponent()}
        {/* result 화면은 별도 라우트에서 렌더링한다고 가정 */}
      </main>

      {isQuestionStep && (
        <nav className="pointer-events-none fixed top-[55%] left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 items-center justify-between px-4">
          {showPrev ? (
            <PaginationButton
              direction="left"
              onClick={handlePrev}
              alt="previous page"
              className="pointer-events-auto"
            />
          ) : (
            <div className="h-14 w-12" aria-hidden="true" />
          )}

          {showNext && (
            <PaginationButton
              direction="right"
              onClick={handleNext}
              alt="next page"
              className="pointer-events-auto"
            />
          )}
        </nav>
      )}
      {showModal && (
        <ModalWrapper>
          <BaseModal
            title="메뉴 추천을 중단하시겠어요?"
            rightButtonText="그만하기"
            leftButtonText="취소"
            isCloseButtonShow={false}
            onRightButtonClick={handleConfirm}
            onLeftButtonClick={() => setShowModal(false)}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
