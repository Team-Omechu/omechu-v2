export interface RecommendMenuItem {
  id: string;
  name: string;
  image_link: string;
}

export interface RecommendManagementSummary {
  totalMenus: number;
  recommendMenus: number;
  exceptedMenus: number;
}

export interface RecommendManagementResponse {
  summary: RecommendManagementSummary;
  recommendMenus: RecommendMenuItem[];
  exceptedMenus: RecommendMenuItem[];
}

export interface ExceptMenuRequest {
  menuId?: string;
  menuName?: string;
}

export interface ExceptMenuResponse {
  id: string;
  menu: RecommendMenuItem;
  message: string;
}

export interface RemoveExceptMenuRequest {
  menuId?: string;
  menuName?: string;
}

export interface RemoveExceptMenuResponse {
  success: boolean;
  message: string;
}
