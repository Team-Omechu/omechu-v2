"use client";

import { useRouter } from "next/navigation";

import { WHO_OPTIONS, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import { Button } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";

export function WhoStep() {
  const router = useRouter();
  const { who, setWho } = useQuestionAnswerStore();
  const { setWhoTag } = useTagStore();

  const handleSelect = (label: string, description: string) => {
    setWho(label);
    setWhoTag(label, description);
    router.push("/mainpage/question-answer/5");
  };

  return (
    <QuestionAnswerLayout title={"혼자 식사하시나요\n누구와 함께 하시나요?"}>
      {WHO_OPTIONS.map(({ label, value, description }) => (
        <Button
          key={value}
          onClick={() => handleSelect(label, description)}
          selected={who === label}
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
