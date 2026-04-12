"use client";

import { useRouter } from "next/navigation";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";
import { moodOptions, useQuestionAnswerStore } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { ListButton } from "@/shared";

export function MoodStep() {
  const router = useRouter();
  const { mood, setMood } = useQuestionAnswerStore();
  const { setMoodTag } = useTagStore();

  const handleSelect = (value: number, label: string, description: string) => {
    setMood(label);
    setMoodTag(label, description);
    router.push("/mainpage/question-answer/4");
  };

  return (
    <QuestionAnswerLayout title="날씨는 어떤가요?">
      {moodOptions.map(({ label, value, description }) => (
        <ListButton
          key={value}
          onClick={() => handleSelect(value, label, description)}
          isSelected={mood === label}
          textSize="base"
        >
          {label}
        </ListButton>
      ))}
    </QuestionAnswerLayout>
  );
}
