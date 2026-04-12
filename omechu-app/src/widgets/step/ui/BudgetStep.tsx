"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ListButton } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";
import { budgetOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

export function BudgetStep() {
  const router = useRouter();
  const { budget, setBudget } = useQuestionAnswerStore();
  const { setBudgetTag } = useTagStore();
  // 각 옵션에 순서대로 value(1,2,3) 할당

  const handleSelect = (value: number, label: string, description: string) => {
    setBudget(label);
    setBudgetTag(label, description);
    router.push("/mainpage/result");
  };

  return (
    <QuestionAnswerLayout title="예산은 어떻게 되시나요?">
      {budgetOptions.map(({ label, value, description }) => (
        <ListButton
          key={value}
          onClick={() => handleSelect(value, label, description)}
          isSelected={budget === label}
          textSize="base"
        >
          {label}
        </ListButton>
      ))}
    </QuestionAnswerLayout>
  );
}
