"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { RandomDrawSelector } from "@/widgets/random-draw";
import { RandomRecommendModal } from "@/widgets/random-recommend-modal";

import { useQuestionAnswerStore } from "@/entities/question";
import {
  EMPTY_RANDOM_DRAW_SELECTION,
  type RandomDrawSelection,
} from "@/entities/random-draw";

import { Header, ModalWrapper } from "@/shared";

export default function RandomRecommendPage() {
  const [showModal, setShowModal] = useState(false);

  const { addition, addAddition, removeAddition } = useQuestionAnswerStore();

  // ✅ RandomDrawSelector가 요구하는 selection 상태
  const [selection, setSelection] = useState<RandomDrawSelection>(
    EMPTY_RANDOM_DRAW_SELECTION,
  );

  const handleModal = () => {
    setShowModal(true);
  };

  // ✅ selection의 "선택된 값들"만 뽑아서 배열화
  const selectedValues = useMemo(() => {
    return Object.values(selection).flat();
  }, [selection]);

  useEffect(() => {
    for (const v of selectedValues) {
      if (!addition.includes(v)) addAddition(v);
    }

    for (const v of addition) {
      if (!selectedValues.includes(v)) removeAddition(v);
    }
  }, [selectedValues, addition, addAddition, removeAddition]);

  // ✅ selector 내부에서 토글된 값이 넘어오면 selection 업데이트
  const handleSelectionChange = (next: RandomDrawSelection) => {
    setSelection(next);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col items-center">
      <Header title="랜덤 추천" showBackButton={false} />

      <div className="mt-8 flex flex-col gap-2 p-4">
        <RandomDrawSelector
          value={selection}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <button
        onClick={handleModal}
        type="button"
        className="active:scale-[0.99]"
      >
        <p className="text-status-error text-center text-[1.25rem] font-bold">
          Press me!
        </p>
        <Image
          src={"/mainpage/randombutton.svg"}
          alt={"randombutton"}
          width={190}
          height={127}
          priority
        />
      </button>

      {showModal && (
        <ModalWrapper>
          <RandomRecommendModal
            confirmText="선택하기"
            retryText="다시 추천"
            onClose={() => setShowModal(false)}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
