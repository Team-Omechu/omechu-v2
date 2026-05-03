"use client";

import { useRouter } from "next/navigation";

import { PURPOSE_OPTIONS, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import { Button } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";

export function PurposeStep() {
  const router = useRouter();
  const { purpose, setPurpose } = useQuestionAnswerStore();
  const { setPurposeTag } = useTagStore();

  const handleSelect = (label: string, description: string) => {
    setPurpose(label);
    setPurposeTag(label, description);
    router.push("/mainpage/question-answer/3");
  };

  return (
    <QuestionAnswerLayout title="식사 목적은 무엇인가요?">
      {PURPOSE_OPTIONS.map(({ label, value, description }) => (
        <Button
          key={value}
          onClick={() => handleSelect(label, description)}
          selected={purpose === label}
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
