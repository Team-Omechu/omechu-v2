"use client";

import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import {
  BasicAllergyForm,
  completeOnboarding,
  useOnboardingStore,
} from "@/entities/onboarding";

const TRIGGER_KEY = "pwa:triggerFromOnboarding";

export default function AllergyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { nickname, exercise, prefer, allergy } = useOnboardingStore();

  const handleSave = async () => {
    await completeOnboarding({
      nickname,
      exercise: exercise as "다이어트 중" | "증량 중" | "유지 중" | null,
      prefer,
      allergy: allergy.filter((a) => a !== "없음"),
    });

    queryClient.invalidateQueries({ queryKey: ["user", "profile"] });

    // 온보딩에서 홈으로 가는 “이번 1회 진입” 트리거
    window.sessionStorage.setItem(TRIGGER_KEY, "1");

    // 홈으로 이동 (replace 권장: 온보딩으로 뒤로가기 방지)
    router.replace("/");
  };

  return (
    <BasicAllergyForm onCancel={() => router.push("/")} onSave={handleSave} />
  );
}
