/** 약관 아이템 타입 */
export interface TermsItem {
  index: number | null;
  about: string | null;
  content: string;
}

/** 약관 타입 (URL slug) */
export type TermsType = "service" | "personal-info" | "location-info";

/** 약관 설정 */
export interface TermsConfig {
  title: string;
  data: TermsItem[];
}
