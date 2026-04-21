import type { AxiosResponse } from "axios";

import { ApiClientError } from "@/entities/user/api/authApi";
import type {
  InquiryRequestBody,
  InquiryResponse,
  ProfileType,
  UpdateProfileBody,
  WithdrawRequestBody,
  WithdrawResponse,
} from "@/entities/user/model/profile.types";

import type { ApiResponse } from "@/shared/config/api.types";
import { axiosInstance } from "@/shared/lib/axiosInstance";
import { HttpError } from "@/shared/lib/httpError";

async function handleApiResponse<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
  fallbackMessage: string,
): Promise<T> {
  try {
    const res = await request;
    const apiResponse = res.data;

    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? fallbackMessage,
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;

    if (error instanceof HttpError) {
      throw new ApiClientError(
        error.message || fallbackMessage,
        error.code,
        error.status,
        error.details,
      );
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : fallbackMessage,
    );
  }
}

export async function fetchProfile(): Promise<ProfileType> {
  return handleApiResponse(
    axiosInstance.get<ApiResponse<ProfileType>>("/user/profile", {
      validateStatus: (s) => s === 200,
      timeout: 5000,
    }),
    "프로필 조회에 실패했습니다.",
  );
}

export async function updateProfile(
  data: UpdateProfileBody,
): Promise<ProfileType> {
  return handleApiResponse(
    axiosInstance.patch<ApiResponse<ProfileType>>("/user/profile", data),
    "프로필 수정에 실패했습니다.",
  );
}

export async function withdrawAccount(
  data: WithdrawRequestBody,
): Promise<WithdrawResponse> {
  return handleApiResponse(
    axiosInstance.post<ApiResponse<WithdrawResponse>>("/user/withdraw", data),
    "회원 탈퇴에 실패했습니다.",
  );
}

export async function submitInquiry(
  data: InquiryRequestBody,
): Promise<InquiryResponse> {
  return handleApiResponse(
    axiosInstance.post<ApiResponse<InquiryResponse>>("/user/inquiry", data),
    "문의 접수에 실패했습니다.",
  );
}
