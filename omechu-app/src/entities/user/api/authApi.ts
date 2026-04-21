import type {
  FindPasswordFormValues,
  LoginFormValues,
  ResetPasswordFormValues,
  SignupFormValues,
} from "@/entities/user/model/auth.schema";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type { ProfileType } from "@/entities/user/model/profile.types";

import type { ApiError, ApiResponse } from "@/shared/config/api.types";
import axiosInstance from "@/shared/lib/axiosInstance";
import { HttpError } from "@/shared/lib/httpError";

export type { ApiResponse, ApiError };

export class ApiClientError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface NotModifiedError extends Error {
  code: 304;
}

export const createNotModifiedError = (): NotModifiedError => {
  const err = new Error("Not Modified") as NotModifiedError;
  err.code = 304;
  return err;
};

export const isNotModifiedError = (err: unknown): err is NotModifiedError => {
  return (
    err instanceof Error &&
    "code" in err &&
    (err as NotModifiedError).code === 304
  );
};

function rethrowAsApiClientError(err: unknown, fallback: string): never {
  if (err instanceof ApiClientError) throw err;
  if (err instanceof HttpError) {
    throw new ApiClientError(
      err.message || fallback,
      err.code,
      err.status,
      err.details,
    );
  }
  throw new ApiClientError(err instanceof Error ? err.message : fallback);
}

export type LoginSuccessData = Partial<ProfileType> & { id: string };

export interface LoginTokens {
  userId: string;
  email?: string;
  accessToken: string;
  refreshToken: string;
}

// 회원가입 성공 시 success 객체 구조
export interface SignupSuccessData {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

// 이메일 인증번호 전송 성공 시 success 객체 구조
export interface SendVerificationCodeSuccessData {
  message: string;
  code: string;
}

// 이메일 인증번호 검증 성공 시 success 객체 구조
export interface VerifyVerificationCodeSuccessData {
  message: string;
}

// 비밀번호 재설정 요청 성공 시 success 객체 구조
export interface RequestPasswordResetSuccessData {
  message: string;
  token: string;
}

// (중복 제거) 온보딩 타입 및 API는 `onboarding/api/onboarding.ts`에서 관리합니다.

// 내부 유틸: store/localStorage 어디에 저장됐든 accessToken 읽기
const readAccessToken = (): string | null => {
  // 1) 우선 zustand store에서 시도
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;

  // 2) 과거/현재 키들을 순회하며 로컬스토리지에서 탐색
  try {
    const candidateKeys = ["auth-storage", "auth-store", "auth-user-storage"];
    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.accessToken ?? null;
      if (token) return token;
    }
  } catch (e) {
    console.warn("[AUTH] readAccessToken localStorage parse error:", e);
  }
  return null;
};

/**
 * 로그인 API
 * @param data email, password
 */
export const login = async (data: LoginFormValues): Promise<LoginTokens> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginTokens>>(
      "/auth/login",
      data,
    );

    const apiResponse = response.data;

    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      // resultType이 FAIL이거나 success 필드가 없을 경우, 에러코드 포함 throw
      const reason = apiResponse.error?.reason || "로그인에 실패했습니다.";
      const code = apiResponse.error?.errorCode;
      throw new ApiClientError(
        reason,
        code,
        response.status,
        apiResponse.error?.data,
      );
    }

    return apiResponse.success as LoginTokens;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "로그인에 실패했습니다.");
  }
};

/**
 * 회원가입 API
 * @param data email, password 등 회원가입 정보
 */
export const signup = async (
  data: SignupFormValues,
): Promise<SignupSuccessData> => {
  const { email, password } = data;
  try {
    const response = await axiosInstance.post<ApiResponse<SignupSuccessData>>(
      "/auth/signup",
      { email, password },
    );
    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason ||
          "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        apiResponse.error?.errorCode,
        undefined,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(
      err,
      "서버 오류로 회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
};

// (삭제) completeOnboarding는 `onboarding/api/onboarding.ts` 사용

/**
 * 이메일 인증번호 전송 API
 * @param email
 */
export const sendVerificationCode = async (
  email: string,
): Promise<SendVerificationCodeSuccessData> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<SendVerificationCodeSuccessData>
    >("/auth/send", { email });

    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "인증번호 전송에 실패했습니다.",
        apiResponse.error?.errorCode,
        response.status,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "인증번호 전송에 실패했습니다.");
  }
};

/**
 * 이메일 인증번호 확인 API
 * @param data email, code
 */
export const verifyVerificationCode = async (data: {
  email: string;
  code: string;
}): Promise<VerifyVerificationCodeSuccessData> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<VerifyVerificationCodeSuccessData>
    >("/auth/verify", data);
    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "이메일 인증에 실패했습니다.",
        apiResponse.error?.errorCode,
        response.status,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "이메일 인증에 실패했습니다.");
  }
};

/**
 * 비밀번호 재설정 요청 API
 */
export const requestPasswordReset = async (
  data: FindPasswordFormValues,
): Promise<RequestPasswordResetSuccessData> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<RequestPasswordResetSuccessData>
    >("/auth/reset-request", data);
    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "비밀번호 재설정 요청에 실패했습니다.",
        apiResponse.error?.errorCode,
        response.status,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "비밀번호 재설정 요청에 실패했습니다.");
  }
};

/**
 * 비밀번호 재설정 API
 * @param data password, passwordConfirm, token
 */
export const resetPassword = async (
  data: ResetPasswordFormValues & { token: string },
): Promise<string> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<string>>(
      `/auth/reset-passwd?token=${encodeURIComponent(data.token)}`,
      { newPassword: data.password },
    );
    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "비밀번호 재설정에 실패했습니다.",
        apiResponse.error?.errorCode,
        response.status,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "비밀번호 재설정에 실패했습니다.");
  }
};

/**
 * 로그아웃 API
 */
export const logout = async (): Promise<void> => {
  // Authorization 헤더는 axiosInstance의 요청 인터셉터에서
  // accessToken을 자동으로 주입합니다.
  await axiosInstance.post("/auth/logout", {});
  useAuthStore.getState().logout();
};

/**
 * 비밀번호 변경 API
 * @param data { currentPassword: string, newPassword: string }
 * @returns 성공 시 메시지(string)
 * 추가 - 이삭
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<string> => {
  const accessToken = readAccessToken();
  if (!accessToken) {
    throw new ApiClientError(
      "accessToken이 없습니다. 먼저 로그인 해주세요.",
      "AUTH_REQUIRED",
    );
  }

  try {
    const response = await axiosInstance.patch<ApiResponse<string>>(
      "/auth/change-passwd",
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "비밀번호 변경에 실패했습니다.",
        apiResponse.error?.errorCode,
        response.status,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    rethrowAsApiClientError(err, "비밀번호 변경에 실패했습니다.");
  }
};

// 현재 로그인된 유저 정보 조회 (accessToken을 명시적으로 붙임)
export const getCurrentUser = async (): Promise<LoginSuccessData> => {
  try {
    const response = await axiosInstance.get<ApiResponse<LoginSuccessData>>(
      "/user/profile",
      {
        // 304도 정상으로 간주해 직접 분기 처리
        validateStatus: (s) => s === 200 || s === 304,
        // 캐시된 304를 줄이기 위한 타임스탬프 파라미터
        params: { _ts: Date.now() },
      },
    );

    // 304: 스토어 캐시로 폴백 후 반환, 없으면 304 에러 throw
    if (response.status === 304) {
      const cached = useAuthStore.getState().user as LoginSuccessData | null;
      if (cached) return cached;
      throw createNotModifiedError();
    }

    // 200 OK 처리
    const apiResponse = response.data;
    if (apiResponse.resultType === "FAIL" || !apiResponse.success) {
      throw new ApiClientError(
        apiResponse.error?.reason || "유저 조회 실패",
        apiResponse.error?.errorCode,
        undefined,
        apiResponse.error?.data,
      );
    }
    return apiResponse.success;
  } catch (err: unknown) {
    if (isNotModifiedError(err)) throw err;
    throw err;
  }
};
