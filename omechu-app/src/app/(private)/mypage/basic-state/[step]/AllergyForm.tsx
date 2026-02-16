"use client";

import { useRouter } from "next/navigation";

import { BasicAllergyForm, useOnboardingStore } from "@/entities/onboarding";
import { useUpdateProfileMutation } from "@/entities/user";
import type {
  AllergyType,
  ExerciseType,
  PreferType,
} from "@/entities/user/model/profile.types";

export default function AllergyForm() {
  const router = useRouter();
  const { exercise, prefer, allergy } = useOnboardingStore();
  const { mutateAsync } = useUpdateProfileMutation();

  const handleSave = async () => {
    await mutateAsync({
      exercise: (exercise ?? undefined) as ExerciseType | undefined,
      prefer: prefer as PreferType[],
      allergy: allergy.filter((a) => a !== "없음") as AllergyType[],
    });
  };

  return (
    <BasicAllergyForm
      onCancel={() => router.push("/mypage")}
      onSave={handleSave}
    />
  );
}
