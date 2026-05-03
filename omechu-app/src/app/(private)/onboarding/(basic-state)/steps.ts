export const BASIC_STATE_STEPS = ["state", "food", "allergy"] as const;
export type BasicStateStep = (typeof BASIC_STATE_STEPS)[number];

export const STEP_LABEL: Record<BasicStateStep, string> = {
  state: "학과/상태",
  food: "선호 음식",
  allergy: "알레르기",
};
