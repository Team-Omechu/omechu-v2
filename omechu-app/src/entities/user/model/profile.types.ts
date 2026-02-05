export type ExerciseType = "다이어트 중" | "증량 중" | "유지 중";

export type PreferType = "한식" | "양식" | "중식" | "일식" | "다른나라";

export type AllergyType =
  | "달걀"
  | "우유"
  | "메밀"
  | "대두"
  | "밀"
  | "땅콩"
  | "호두"
  | "잣"
  | "돼지고기"
  | "소고기"
  | "닭고기"
  | "고등어"
  | "새우"
  | "게"
  | "오징어"
  | "조개류"
  | "복숭아"
  | "토마토"
  | "아황산류";

export interface ProfileType {
  id: string;
  email?: string;
  nickname: string;
  exercise: ExerciseType | null;
  prefer: PreferType[];
  allergy: AllergyType[];
}

export interface UpdateProfileBody {
  nickname?: string;
  exercise?: ExerciseType;
  prefer?: PreferType[];
  allergy?: AllergyType[];
}

export interface WithdrawRequestBody {
  confirmed: boolean;
  reason: string;
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
}
