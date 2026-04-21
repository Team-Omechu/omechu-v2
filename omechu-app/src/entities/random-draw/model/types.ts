export type RandomDrawGroupKey =
  | "type"
  | "ingredient"
  | "soup"
  | "temperature"
  | "health";

export type RandomDrawOption = {
  value: string;
  label: string;
  width?: "sm" | "md";
};

export type RandomDrawGroup = {
  key: RandomDrawGroupKey;
  options: RandomDrawOption[];
};

// ✅ 그룹별로 여러 개 선택 가능
export type RandomDrawSelection = Record<RandomDrawGroupKey, string[]>;
