import axios from "axios";

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

export class ProfileApiError extends Error {
  constructor(
    public code: number,
    public info?: unknown,
  ) {
    super("Profile API Error");
    this.name = "ProfileApiError";
  }
}

export async function fetchProfile(): Promise<ProfileType> {
  try {
    const res = await axiosInstance.get<ApiResponse<ProfileType>>(
      "/user/profile",
      {
        validateStatus: (s) => s === 200,
        timeout: 5000,
      },
    );

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ProfileApiError(
        res.status,
        apiResponse.error?.reason ?? "프로필 조회에 실패했습니다.",
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    if (error instanceof ProfileApiError) throw error;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const reason =
        (error.response?.data as ApiResponse<unknown>)?.error?.reason ??
        error.message;
      throw new ProfileApiError(status, reason);
    }

    throw new ProfileApiError(500, "알 수 없는 오류가 발생했습니다.");
  }
}

export async function updateProfile(
  data: UpdateProfileBody,
): Promise<ProfileType> {
  try {
    const res = await axiosInstance.patch<ApiResponse<ProfileType>>(
      "/user/profile",
      data,
    );

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "프로필 수정에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;

    if (axios.isAxiosError(error)) {
      const api = error.response?.data as ApiResponse<unknown> | undefined;
      throw new ApiClientError(
        api?.error?.reason ?? error.message ?? "프로필 수정에 실패했습니다.",
        api?.error?.errorCode,
        error.response?.status,
        api?.error?.data,
      );
    }

    throw new ApiClientError("알 수 없는 오류가 발생했습니다.");
  }
}

export async function withdrawAccount(
  data: WithdrawRequestBody,
): Promise<WithdrawResponse> {
  try {
    const res = await axiosInstance.post<ApiResponse<WithdrawResponse>>(
      "/user/withdraw",
      data,
    );

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "회원 탈퇴에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;

    if (axios.isAxiosError(error)) {
      const api = error.response?.data as ApiResponse<unknown> | undefined;
      throw new ApiClientError(
        api?.error?.reason ?? error.message ?? "회원 탈퇴에 실패했습니다.",
        api?.error?.errorCode,
        error.response?.status,
        api?.error?.data,
      );
    }

    throw new ApiClientError("알 수 없는 오류가 발생했습니다.");
  }
}

export async function submitInquiry(
  data: InquiryRequestBody,
): Promise<InquiryResponse> {
  try {
    const res = await axiosInstance.post<ApiResponse<InquiryResponse>>(
      "/user/inquiry",
      data,
    );

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "문의 접수에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error;

    if (axios.isAxiosError(error)) {
      const api = error.response?.data as ApiResponse<unknown> | undefined;
      throw new ApiClientError(
        api?.error?.reason ?? error.message ?? "문의 접수에 실패했습니다.",
        api?.error?.errorCode,
        error.response?.status,
        api?.error?.data,
      );
    }

    throw new ApiClientError("알 수 없는 오류가 발생했습니다.");
  }
}
