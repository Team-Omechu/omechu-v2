"use client";

import { useRouter } from "next/navigation";

import { ListButton } from "@/shared";
import { QuestionAnswerLayout } from "./QuestionAnswerLayout";
import { mealTimeOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

export function MealTimeStep() {
  const router = useRouter();
  const { mealTime, setMealTime } = useQuestionAnswerStore();
  const { setMealTimeTag } = useTagStore();

  const handleSelect = (value: number, label: string, description: string) => {
    setMealTime(label);
    setMealTimeTag(label, description);
    router.push("/mainpage/question-answer/2");
  };

  return (
    <QuestionAnswerLayout title="언제 먹는 건가요?">
      {mealTimeOptions.map(({ label, value, description }) => (
        <ListButton
          type="button"
          key={value}
          onClick={() => handleSelect(value, label, description)}
          isSelected={mealTime === label}
          textSize="base"
        >
          {label}
        </ListButton>
      ))}
    </QuestionAnswerLayout>
  );
}
