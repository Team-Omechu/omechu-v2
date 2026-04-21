// UI 레이어에서 에러 메시지/코드를 일관되게 잡기 위한 공용 에러 타입.
// Supabase AuthError / PostgrestError 등 외부 에러도 `{ message, code? }` 구조를
//만족하므로 타입 캐스팅만으로 호환된다.
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
