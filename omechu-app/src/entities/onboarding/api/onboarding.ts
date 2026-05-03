import {
  type ExerciseKind,
  type PreferKind,
  setAllergiesByLabels,
  setPreferences,
  updateProfileSupabase,
} from "@/entities/user";

export interface OnboardingRequestData {
  nickname: string;
  exercise: "다이어트 중" | "증량 중" | "유지 중" | null;
  prefer: string[];
  allergy: string[];
}

export interface OnboardingSuccessData {
  nickname: string;
  exercise: "다이어트 중" | "증량 중" | "유지 중" | null;
  prefer: string[];
  allergy: string[];
}

const EXERCISE_KO_TO_KIND: Record<string, ExerciseKind> = {
  "다이어트 중": "cutting",
  "증량 중": "bulking",
  "유지 중": "maintenance",
};

const PREFER_KO_TO_KIND: Record<string, PreferKind> = {
  한식: "korean",
  양식: "western",
  중식: "chinese",
  일식: "japanese",
  다른나라: "other",
};

export const completeOnboarding = async (
  data: OnboardingRequestData,
): Promise<OnboardingSuccessData> => {
  const exerciseKind = data.exercise
    ? (EXERCISE_KO_TO_KIND[data.exercise] ?? null)
    : null;

  const preferKinds = data.prefer
    .map((p) => PREFER_KO_TO_KIND[p])
    .filter((k): k is PreferKind => Boolean(k));

  await Promise.all([
    updateProfileSupabase({
      nickname: data.nickname,
      exercise: exerciseKind,
    }),
    setPreferences(preferKinds),
    setAllergiesByLabels(data.allergy),
  ]);

  return data;
};
