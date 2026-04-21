import type { RandomDrawGroup, RandomDrawSelection } from "./types";

export const RANDOM_DRAW_GROUPS: RandomDrawGroup[] = [
  {
    key: "type",
    options: [
      { value: "한식", label: "한식", width: "sm" },
      { value: "중식", label: "중식", width: "sm" },
      { value: "일식", label: "일식", width: "sm" },
      { value: "양식", label: "양식", width: "sm" },
      { value: "그 외", label: "그 외", width: "sm" },
    ],
  },
  {
    key: "ingredient",
    options: [
      { value: "밥", label: "밥", width: "sm" },
      { value: "면", label: "면", width: "sm" },
      { value: "고기", label: "고기", width: "sm" },
      { value: "해산물", label: "해산물", width: "sm" },
      { value: "그 외(재료)", label: "그 외", width: "sm" },
    ],
  },
  {
    key: "soup",
    options: [
      { value: "국물 있는 음식", label: "국물 있는 음식", width: "md" },
      { value: "국물 없는 음식", label: "국물 없는 음식", width: "md" },
    ],
  },
  {
    key: "temperature",
    options: [
      { value: "따뜻한 음식", label: "따뜻한 음식", width: "md" },
      { value: "차가운 음식", label: "차가운 음식", width: "md" },
    ],
  },
  {
    key: "health",
    options: [
      { value: "건강한 음식", label: "건강한 음식", width: "md" },
      { value: "자극적인 음식", label: "자극적인 음식", width: "md" },
    ],
  },
];

export const EMPTY_RANDOM_DRAW_SELECTION: RandomDrawSelection = {
  type: [],
  ingredient: [],
  soup: [],
  temperature: [],
  health: [],
};
