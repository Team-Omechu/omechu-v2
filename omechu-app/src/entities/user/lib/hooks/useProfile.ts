import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type ExerciseKind,
  type PreferKind,
  fetchProfile as fetchSupabaseProfile,
  setAllergiesByLabels,
  setPreferences,
  updateProfile as updateSupabaseProfile,
} from "@/entities/user/api/supabaseProfile";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type {
  AllergyType,
  ExerciseType,
  PreferType,
  ProfileType,
  UpdateProfileBody,
} from "@/entities/user/model/profile.types";

const EXERCISE_MAP: Record<string, ExerciseType> = {
  cutting: "다이어트 중",
  bulking: "증량 중",
  maintenance: "유지 중",
};

const PREFER_MAP: Record<string, PreferType> = {
  korean: "한식",
  western: "양식",
  chinese: "중식",
  japanese: "일식",
  other: "다른나라",
};

const REVERSE_EXERCISE_MAP: Record<ExerciseType, ExerciseKind> = {
  "다이어트 중": "cutting",
  "증량 중": "bulking",
  "유지 중": "maintenance",
};

const REVERSE_PREFER_MAP: Record<PreferType, PreferKind> = {
  한식: "korean",
  양식: "western",
  중식: "chinese",
  일식: "japanese",
  다른나라: "other",
};

async function fetchAndMapProfile(): Promise<ProfileType> {
  const { profile, prefers, allergies } = await fetchSupabaseProfile();
  return {
    id: profile.id as string,
    email: (profile.email as string | null) ?? undefined,
    nickname: (profile.nickname as string | null) ?? "",
    exercise: profile.exercise
      ? (EXERCISE_MAP[profile.exercise as string] ?? null)
      : null,
    prefer: (prefers as string[])
      .map((p) => PREFER_MAP[p])
      .filter(Boolean) as PreferType[],
    allergy: (
      allergies as unknown as { allergy_min: { allergy: string } | null }[]
    )
      .map((a) => a.allergy_min?.allergy)
      .filter(Boolean) as AllergyType[],
  };
}

export function useProfile() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { data, isLoading, error, isSuccess, isError } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchAndMapProfile,
    enabled: isLoggedIn,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 10,
  });

  const resolvedData = isLoggedIn ? (data ?? null) : null;

  return {
    profile: resolvedData,
    loading: isLoading,
    error:
      isLoggedIn && error
        ? { message: "프로필 정보를 불러올 수 없습니다.", raw: error }
        : null,
    isSuccess,
    isError,
    data: resolvedData,
  };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: UpdateProfileBody) => {
      const dbUpdates: Parameters<typeof updateSupabaseProfile>[0] = {};
      if (data.nickname !== undefined) dbUpdates.nickname = data.nickname;
      if (data.exercise !== undefined) {
        dbUpdates.exercise = data.exercise
          ? REVERSE_EXERCISE_MAP[data.exercise]
          : null;
      }

      await Promise.all([
        updateSupabaseProfile(dbUpdates),
        data.prefer !== undefined
          ? setPreferences(data.prefer.map((p) => REVERSE_PREFER_MAP[p]))
          : Promise.resolve(),
        data.allergy !== undefined
          ? setAllergiesByLabels(data.allergy)
          : Promise.resolve(),
      ]);

      return await fetchAndMapProfile();
    },
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile);
      queryClient.setQueryData(["user", "profile"], updatedProfile);
    },
  });
}
