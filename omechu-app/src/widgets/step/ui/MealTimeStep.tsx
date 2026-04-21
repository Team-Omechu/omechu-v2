"use client";

import { useRouter } from "next/navigation";

import { mealTimeOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import { Button } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";

export function MealTimeStep() {
  const router = useRouter();
  const { mealTime, setMealTime } = useQuestionAnswerStore();
  const { setMealTimeTag } = useTagStore();

  const handleSelect = (label: string, description: string) => {
    setMealTime(label);
    setMealTimeTag(label, description);
    router.push("/mainpage/question-answer/2");
  };

  return (
    <QuestionAnswerLayout title="언제 먹는 건가요?">
      {mealTimeOptions.map(({ label, value, description }) => (
        <Button
          key={value}
          onClick={() => handleSelect(label, description)}
          selected={mealTime === label}
          width="lg"
          height="auto"
          radius="md"
          className="min-h-12 px-4 py-2"
        >
          {label}
        </Button>
      ))}
    </QuestionAnswerLayout>
  );
}
