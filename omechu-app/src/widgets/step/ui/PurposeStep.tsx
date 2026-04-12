"use client";

import { useRouter } from "next/navigation";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";
import { purposeOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { ListButton } from "@/shared";

export function PurposeStep() {
  const router = useRouter();
  const { purpose, setPurpose } = useQuestionAnswerStore();
  const { setPurposeTag } = useTagStore();

  const handleSelect = (value: number, label: string, description: string) => {
    setPurpose(label);
    setPurposeTag(label, description);
    router.push("/mainpage/question-answer/3");
  };

  return (
    <QuestionAnswerLayout title="식사 목적은 무엇인가요?">
      {purposeOptions.map(({ label, value, description }) => (
        <ListButton
          key={value}
          onClick={() => handleSelect(value, label, description)}
          isSelected={purpose === label}
          textSize="base"
        >
          {label}
        </ListButton>
      ))}
    </QuestionAnswerLayout>
  );
}
