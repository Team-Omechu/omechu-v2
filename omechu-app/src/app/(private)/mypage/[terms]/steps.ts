//! 26.01.12 작업 중

export const BASIC_STATE_STEPS = ["service", "personal", "location"] as const;
export type BasicStateStep = (typeof BASIC_STATE_STEPS)[number];

export const STEP_LABEL: Record<BasicStateStep, string> = {
  service: "서비스 이용약관",
  personal: "개인 정보 처리 방침",
  location: "위치기반 서비스 이용약관",
};
