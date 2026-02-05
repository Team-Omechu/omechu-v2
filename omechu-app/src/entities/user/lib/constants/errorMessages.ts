/**
 * 사용자 인증/프로필 관련 에러 메시지
 * 백엔드 에러 코드별 사용자 친화적 메시지 맵핑
 *
 * 사용 예시:
 * ```
 * import { getAuthErrorMessage } from "@/entities/user/lib/constants/errorMessages";
 * const msg = getAuthErrorMessage(errorCode, "기본 메시지");
 * ```
 */

/**
 * 인증 에러 메시지 맵 (에러 코드 → 사용자 메시지)
 *
 * 에러 코드 분류:
 * - C00x: 클라이언트 입력 에러 (이메일/비밀번호)
 * - E00x: 리소스 에러 (사용자 없음, 토큰 만료)
 * - S00x: 세션 에러
 * - T00x: 토큰 에러
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // ========== 로그인 에러 ==========
  // C001: 이메일 또는 비밀번호 입력 필요
  C001: "이메일 또는 비밀번호를 입력해 주세요.",

  // C002: 비밀번호 불일치
  C002: "이메일 또는 비밀번호가 올바르지 않습니다. 입력한 내용을 다시 확인해 주세요.",

  // C003: 로그인 필요
  C003: "로그인이 필요합니다. 다시 시도해 주세요.",

  // ========== 회원가입 에러 ==========
  // INVALID_INPUT: 필수값 누락 또는 형식 오류
  INVALID_INPUT: "필수 입력값을 확인해 주세요.",

  // 사용자 이미 존재 (중복 이메일)
  USER_ALREADY_EXISTS: "이미 가입된 이메일입니다.",

  // ========== 토큰/리소스 에러 ==========
  // E001: 유효하지 않거나 만료된 토큰
  E001: "링크가 만료되었어요. 비밀번호 찾기를 다시 진행해 주세요.",

  // E002: 사용자를 찾을 수 없음
  E002: "이메일이 올바르지 않습니다. 입력한 내용을 다시 확인해 주세요.",

  // ========== 세션/인증 에러 ==========
  // S001: 세션 만료
  S001: "세션이 만료되었어요. 다시 로그인해 주세요.",

  // T001: 토큰 만료
  T001: "인증이 만료되었어요. 다시 로그인해 주세요.",

  // T002: Bearer 토큰 없음 또는 잘못됨
  T002: "인증에 문제가 발생했어요. 다시 로그인해 주세요.",

  // T003: Bearer 토큰 검증 실패
  T003: "인증에 문제가 발생했어요. 다시 로그인해 주세요.",

  // ========== 서버 에러 ==========
  SERVER_ERROR: "서버에 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
};

/**
 * 에러 코드에 해당하는 메시지를 조회합니다
 *
 * @param errorCode 백엔드에서 반환한 에러 코드
 * @param defaultMessage 매핑되는 메시지가 없을 때 반환할 기본 메시지
 * @returns 사용자 친화적 에러 메시지
 *
 * @example
 * ```
 * const msg = getAuthErrorMessage("C001", "로그인 실패");
 * // → "이메일 또는 비밀번호를 입력해 주세요."
 *
 * const msg = getAuthErrorMessage("UNKNOWN", "로그인 실패");
 * // → "로그인 실패"
 * ```
 */
export const getAuthErrorMessage = (
  errorCode: string | undefined,
  defaultMessage: string = "오류가 발생했습니다.",
): string => {
  if (!errorCode) return defaultMessage;
  return AUTH_ERROR_MESSAGES[errorCode] || defaultMessage;
};
