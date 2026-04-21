"use client";

import { BasicAllergyForm, useOnboardingStore } from "@/entities/onboarding";
import {
  type AllergyType,
  type ExerciseType,
  type PreferType,
  useUpdateProfileMutation,
} from "@/entities/user";

export default function AllergyForm() {
  const { exercise, prefer, allergy } = useOnboardingStore();
  const { mutateAsync } = useUpdateProfileMutation();

  const handleSave = async () => {
    await mutateAsync({
      exercise: (exercise ?? undefined) as ExerciseType | undefined,
      prefer: prefer as PreferType[],
      allergy: allergy.filter((a) => a !== "없음") as AllergyType[],
    });
  };

  return <BasicAllergyForm cancelHref="/mypage" onSave={handleSave} />;
}
