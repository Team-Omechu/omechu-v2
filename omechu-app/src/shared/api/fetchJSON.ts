type ApiError = {
  reason?: string;
  message?: string;
};

type WrappedResponse<T> = {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
  error?: ApiError;
};

export async function fetchJSON<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // body 없는 경우
  }

  // 1️⃣ resultType 기반 API
  if (typeof data === "object" && data !== null && "resultType" in data) {
    const wrapped = data as WrappedResponse<T>;

    if (wrapped.resultType !== "SUCCESS") {
      throw new Error(
        wrapped.error?.reason ||
          wrapped.error?.message ||
          "서버 요청에 실패했습니다.",
      );
    }

    return wrapped.success as T;
  }

  // 2️⃣ 일반 REST API
  if (!res.ok) {
    // ✅ 리스트 API에서 404 = 데이터 없음 (정상 종료)
    if (res.status === 404) {
      return [] as T;
    }

    const errorData = data as ApiError | null;
    throw new Error(
      errorData?.message || errorData?.reason || "서버 요청에 실패했습니다.",
    );
  }

  return data as T;
}
