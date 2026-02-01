"use client";

import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import {
  BasicAllergyForm,
  completeOnboarding,
  useOnboardingStore,
} from "@/entities/onboarding";

export default function AllergyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { nickname, exercise, prefer, allergy } = useOnboardingStore();

  const handleSave = async () => {
    await completeOnboarding({
      nickname,
      exercise: exercise as "다이어트 중" | "증량 중" | "유지 중" | null,
      prefer,
      allergy,
    });
    queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
  };

  return (
    <BasicAllergyForm onCancel={() => router.push("/")} onSave={handleSave} />
  );
}
