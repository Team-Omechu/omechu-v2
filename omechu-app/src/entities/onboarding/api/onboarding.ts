import {
  type ExerciseKind,
  type PreferKind,
  setAllergies,
  setPreferences,
  updateProfileSupabase,
} from "@/entities/user";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

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

async function resolveAllergyIds(names: string[]): Promise<number[]> {
  if (names.length === 0) return [];
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb
    .from("allergy_min")
    .select("id, allergy")
    .in("allergy", names);
  if (error) throw error;
  return (data ?? []).map((r) => r.id as number);
}

export const completeOnboarding = async (
  data: OnboardingRequestData,
): Promise<OnboardingSuccessData> => {
  const exerciseKind = data.exercise
    ? (EXERCISE_KO_TO_KIND[data.exercise] ?? null)
    : null;

  const preferKinds = data.prefer
    .map((p) => PREFER_KO_TO_KIND[p])
    .filter((k): k is PreferKind => Boolean(k));

  const allergyIds = await resolveAllergyIds(data.allergy);

  await Promise.all([
    updateProfileSupabase({
      nickname: data.nickname,
      exercise: exerciseKind,
    }),
    setPreferences(preferKinds),
    setAllergies(allergyIds),
  ]);

  return data;
};
