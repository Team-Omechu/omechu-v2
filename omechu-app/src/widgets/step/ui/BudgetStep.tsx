"use client";

import { useRouter } from "next/navigation";

import { budgetOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import { Button } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";

export function BudgetStep() {
  const router = useRouter();
  const { budget, setBudget } = useQuestionAnswerStore();
  const { setBudgetTag } = useTagStore();

  const handleSelect = (label: string, description: string) => {
    setBudget(label);
    setBudgetTag(label, description);
    router.push("/mainpage/result");
  };

  return (
    <QuestionAnswerLayout title="예산은 어떻게 되시나요?">
      {budgetOptions.map(({ label, value, description }) => (
        <Button
          key={value}
          onClick={() => handleSelect(label, description)}
          selected={budget === label}
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
