import axios, { type AxiosError } from "axios";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

type WrappedErrorPayload = {
  errorCode?: string;
  reason?: string;
  code?: string;
  message?: string;
  data?: unknown;
};

type ErrorBody = {
  // 플랫 스키마 (route handler): { error:true, code, message, details }
  code?: string;
  message?: string;
  reason?: string;
  errorCode?: string;
  details?: unknown;
  // 래핑 스키마 (backend): { resultType:"FAIL", error:{ errorCode, reason, data } }
  resultType?: "SUCCESS" | "FAIL";
  error?: WrappedErrorPayload | boolean;
};

function extractFromBody(
  body: ErrorBody | null | undefined,
  status: number,
): { code: string; message: string; details: unknown } {
  // 래핑 스키마: { resultType:"FAIL", error:{ errorCode, reason, data } }
  if (body?.error && typeof body.error === "object") {
    const wrapped = body.error as WrappedErrorPayload;
    return {
      code: wrapped.errorCode ?? wrapped.code ?? `HTTP_${status}`,
      message: wrapped.reason ?? wrapped.message ?? "서버 요청에 실패했습니다.",
      details: wrapped.data,
    };
  }

  // 플랫 스키마: { code, message, details }
  return {
    code: body?.code ?? body?.errorCode ?? `HTTP_${status}`,
    message: body?.message ?? body?.reason ?? "서버 요청에 실패했습니다.",
    details: body?.details,
  };
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;

  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ErrorBody>;
    const status = axiosErr.response?.status ?? 0;

    if (status === 0) {
      return new HttpError({
        status: 0,
        code: "NETWORK_ERROR",
        message: axiosErr.message || "네트워크 오류가 발생했습니다.",
      });
    }

    const extracted = extractFromBody(axiosErr.response?.data, status);
    return new HttpError({
      status,
      code: extracted.code,
      message: extracted.message,
      details: extracted.details,
    });
  }

  if (err instanceof Error) {
    return new HttpError({
      status: 0,
      code: "UNKNOWN_ERROR",
      message: err.message,
    });
  }

  return new HttpError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: String(err),
  });
}
