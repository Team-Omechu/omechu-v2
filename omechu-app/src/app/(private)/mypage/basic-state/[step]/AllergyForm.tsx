"use client";

import { useRouter } from "next/navigation";

import { BasicAllergyForm, useOnboardingStore } from "@/entities/onboarding";
import { updateProfile } from "@/entities/user/api/profileApi";
import type {
  AllergyType,
  ExerciseType,
  PreferType,
} from "@/entities/user/model/profile.types";

export default function AllergyForm() {
  const router = useRouter();
  const { exercise, prefer, allergy } = useOnboardingStore();

  const handleSave = async () => {
    await updateProfile({
      exercise: (exercise ?? undefined) as ExerciseType | undefined,
      prefer: prefer as PreferType[],
      allergy: allergy as AllergyType[],
    });
  };

  return (
    <BasicAllergyForm
      onCancel={() => router.push("/mypage")}
      onSave={handleSave}
    />
  );
}
