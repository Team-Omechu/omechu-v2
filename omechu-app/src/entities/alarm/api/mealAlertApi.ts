import type {
  MealAlertPatchBody,
  MealAlertsResponse,
  MealAlertToggleResponse,
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
