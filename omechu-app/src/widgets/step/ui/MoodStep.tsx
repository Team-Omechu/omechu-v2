"use client";

import { useRouter } from "next/navigation";

import { moodOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";

import { Button } from "@/shared";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";

export function MoodStep() {
  const router = useRouter();
  const { mood, setMood } = useQuestionAnswerStore();
  const { setMoodTag } = useTagStore();

  const handleSelect = (label: string, description: string) => {
    setMood(label);
    setMoodTag(label, description);
    router.push("/mainpage/question-answer/4");
  };

  return (
    <QuestionAnswerLayout title="날씨는 어떤가요?">
      {moodOptions.map(({ label, value, description }) => (
        <Button
          key={value}
          onClick={() => handleSelect(label, description)}
          selected={mood === label}
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
