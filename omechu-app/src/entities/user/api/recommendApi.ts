import axios from "axios";

import { ApiClientError } from "@/entities/user/api/authApi";
import type {
  ExceptMenuRequest,
  ExceptMenuResponse,
  RecommendManagementResponse,
  RemoveExceptMenuRequest,
  RemoveExceptMenuResponse,
} from "@/entities/user/model/recommend.types";
import type { ApiResponse } from "@/shared/config/api.types";
import { axiosInstance } from "@/shared/lib/axiosInstance";

function handleApiError(error: unknown, fallbackMessage: string): never {
  if (error instanceof ApiClientError) throw error;

  if (axios.isAxiosError(error)) {
    const api = error.response?.data as ApiResponse<unknown> | undefined;
    throw new ApiClientError(
      api?.error?.reason ?? error.message ?? fallbackMessage,
      api?.error?.errorCode,
      error.response?.status,
      api?.error?.data,
    );
  }

  throw new ApiClientError(fallbackMessage);
}

export async function fetchRecommendManagement(): Promise<RecommendManagementResponse> {
  try {
    const res = await axiosInstance.get<
      ApiResponse<RecommendManagementResponse>
    >("/user/recommend/management");

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "추천 목록 조회에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    handleApiError(error, "추천 목록 조회에 실패했습니다.");
  }
}

export async function exceptMenu(
  data: ExceptMenuRequest,
): Promise<ExceptMenuResponse> {
  try {
    const res = await axiosInstance.post<ApiResponse<ExceptMenuResponse>>(
      "/user/recommend/except",
      data,
    );

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "메뉴 제외에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    handleApiError(error, "메뉴 제외에 실패했습니다.");
  }
}

export async function removeExceptMenu(
  data: RemoveExceptMenuRequest,
): Promise<RemoveExceptMenuResponse> {
  try {
    const res = await axiosInstance.post<
      ApiResponse<RemoveExceptMenuResponse>
    >("/user/recommend/except/remove", data);

    const apiResponse = res.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ?? "메뉴 제외 해제에 실패했습니다.",
        apiResponse.error?.errorCode,
        res.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success;
  } catch (error: unknown) {
    handleApiError(error, "메뉴 제외 해제에 실패했습니다.");
  }
}
