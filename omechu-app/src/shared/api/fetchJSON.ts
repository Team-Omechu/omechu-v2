import type { AxiosRequestHeaders, Method } from "axios";

import { axiosInstance } from "@/shared/lib/axiosInstance";
import { HttpError } from "@/shared/lib/httpError";

type WrappedError = {
  reason?: string;
  message?: string;
  errorCode?: string;
  code?: string;
};

type WrappedResponse<T> = {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
  error?: WrappedError;
};

function isWrapped(value: unknown): value is WrappedResponse<unknown> {
  return typeof value === "object" && value !== null && "resultType" in value;
}

function toAxiosHeaders(
  headers: RequestInit["headers"],
): AxiosRequestHeaders | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((v, k) => (out[k] = v));
    return out as AxiosRequestHeaders;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers) as AxiosRequestHeaders;
  }
  return headers as AxiosRequestHeaders;
}

/**
 * 래핑/비래핑 REST API 공용 호출.
 * - `resultType` 래핑된 응답은 `success`를 자동 언래핑.
 * - 리스트 엔드포인트의 404는 빈 배열로 정상 종료.
 * - 그 외 에러는 axios interceptor에서 `HttpError`로 이미 정규화됨.
 */
export async function fetchJSON<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const res = await axiosInstance.request<unknown>({
      url: path,
      method: (options?.method ?? "GET") as Method,
      data: options?.body,
      headers: toAxiosHeaders(options?.headers),
    });

    const data = res.data;

    if (isWrapped(data)) {
      const wrapped = data as WrappedResponse<T>;
      if (wrapped.resultType !== "SUCCESS") {
        throw new HttpError({
          status: res.status,
          code: wrapped.error?.code ?? wrapped.error?.errorCode ?? "API_FAIL",
          message:
            wrapped.error?.reason ??
            wrapped.error?.message ??
            "서버 요청에 실패했습니다.",
        });
      }
      return wrapped.success as T;
    }

    return data as T;
  } catch (err) {
    // 리스트 API 404 = 데이터 없음 (정상 종료)
    if (err instanceof HttpError && err.status === 404) {
      return [] as T;
    }
    throw err;
  }
}
