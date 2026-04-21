// TODO(supabase-migration): supabaseProfile의 updateProfile + setPreferences + setAllergies + saveAgreement 조합으로 이전 가능.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import type { ApiResponse } from "@/shared/config/api.types";
import { axiosInstance } from "@/shared/lib/axiosInstance";

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

export const completeOnboarding = async (
  data: OnboardingRequestData,
): Promise<OnboardingSuccessData> => {
  const response = await axiosInstance.patch<
    ApiResponse<OnboardingSuccessData>
  >("/user/complete", data);

  const apiResponse = response.data;

  if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
    throw new Error(apiResponse.error?.reason || "정보 저장에 실패했습니다.");
  }

  return apiResponse.success;
};
