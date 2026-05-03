import type { SignupFormValues } from "@/entities/user";

import type { TermsType } from "@/shared";

/**
 * 회원가입 약관 모달 타입
 * - service: 서비스 이용약관
 * - privacy: 개인정보 처리방침
 * - location: 위치기반 서비스 이용약관
 */
export type ModalType = "service" | "privacy" | "location";

/**
 * ModalType → TermsType (TERMS_CONFIG 키) 매핑
 */
export const MODAL_TO_TERMS_TYPE: Record<ModalType, TermsType> = {
  service: "service",
  privacy: "personal-info",
  location: "location-info",
} as const;

/**
 * ModalType → SignupFormValues 필드명 매핑
 */
export const MODAL_TO_FORM_FIELD: Record<
  ModalType,
  keyof Pick<
    SignupFormValues,
    "termsService" | "termsPrivacy" | "termsLocation"
  >
> = {
  service: "termsService",
  privacy: "termsPrivacy",
  location: "termsLocation",
} as const;
