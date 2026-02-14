export type MealType = "breakfast" | "lunch" | "dinner" | "night";

export interface MealAlertItem {
  enabled: boolean;
  time: string;
  min: string;
  max: string;
}

export interface MealAlertsResponse {
  resultType: "SUCCESS" | "FAIL";
  error: { errorCode: string; reason: string; data: unknown } | null;
  success: {
    enabled: boolean;
    alerts: Record<MealType, MealAlertItem>;
  } | null;
}

export interface MealAlertToggleResponse {
  resultType: "SUCCESS" | "FAIL";
  error: { errorCode: string; reason: string; data: unknown } | null;
  success: { enabled: boolean } | null;
}

export type MealAlertPatchBody = Partial<
  Record<MealType, { enabled?: boolean; time?: string }>
>;
