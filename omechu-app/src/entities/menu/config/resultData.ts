// resultData.ts
export interface RecommendMenuRequest {
  동반자: string | null;
  식사목적: string | null;
  날씨: string | null;
  언제: string | null;
  선호음식?: string | null;
  예산: string | null;
  제외음식?: string[] | null;
  알레르기?: string[] | null;
  이전추천메뉴?: string[] | null;
}

export interface RandomMenuRequest {
  addition: string[] | null;
}

export type RandomMenu = {
  name: string;
  image_link: string;
};

export type MenuItem = {
  menu: string;
  text: string;
  image_link: string;
  allergens: string[];
};

export type MenuListResponse = {
  query_text: string;
  results: MenuItem[];
};

export type menuType = {
  id: number;
  title: string;
  description: string;
  image: string;
  nutrition: number;
  allergens: string[];
  recipeUrl: string;
};
