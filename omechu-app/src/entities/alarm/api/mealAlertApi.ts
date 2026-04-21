// TODO(supabase-migration): `meal_alert` 테이블 + RLS로 이전 필요.
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import type {
  MealAlertPatchBody,
  MealAlertToggleResponse,
  MealAlertsResponse,
} from "@/entities/alarm/model/alarm.types";

import { axiosInstance } from "@/shared";

export const getMealAlerts = async (): Promise<MealAlertsResponse> => {
  const { data } =
    await axiosInstance.get<MealAlertsResponse>("/user/meal-alerts");
  return data;
};

export const patchMealAlerts = async (
  body: MealAlertPatchBody,
): Promise<MealAlertsResponse> => {
  const { data } = await axiosInstance.patch<MealAlertsResponse>(
    "/user/meal-alerts",
    body,
  );
  return data;
};

export const toggleMealAlerts = async (
  enabled: boolean,
): Promise<MealAlertToggleResponse> => {
  const { data } = await axiosInstance.post<MealAlertToggleResponse>(
    "/user/meal-alerts/toggle",
    { enabled },
  );
  return data;
};
