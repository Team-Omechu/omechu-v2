import type {
  MealAlertItem,
  MealAlertPatchBody,
  MealAlertToggleResponse,
  MealAlertsResponse,
  MealType,
} from "@/entities/alarm/model/alarm.types";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

// meal_time.comment → MealType 매핑
const COMMENT_TO_TYPE: Record<string, MealType> = {
  아침: "breakfast",
  점심: "lunch",
  저녁: "dinner",
  야식: "night",
};

const TYPE_RANGE: Record<MealType, { min: string; max: string }> = {
  breakfast: { min: "05:00", max: "10:59" },
  lunch: { min: "11:00", max: "14:59" },
  dinner: { min: "17:00", max: "20:59" },
  night: { min: "21:00", max: "23:59" },
};

interface MealTimeRow {
  id: number;
  alert_time: string | null;
  comment: string | null;
}

interface MealAlertRow {
  meal_id: number;
  enabled: boolean;
  alarm_time: string | null;
}

async function getAuthedUserId(): Promise<string> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("unauthorized");
  return data.user.id;
}

function normalizeTime(t: string | null | undefined): string {
  if (!t) return "";
  // "HH:MM:SS" → "HH:MM"
  return t.length > 5 ? t.slice(0, 5) : t;
}

async function fetchJoined(): Promise<
  { type: MealType; mealId: number; item: MealAlertItem }[]
> {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();

  const [times, alerts] = await Promise.all([
    sb.from("meal_time").select("id, alert_time, comment"),
    sb
      .from("meal_alert")
      .select("meal_id, enabled, alarm_time")
      .eq("user_id", userId),
  ]);
  if (times.error) throw times.error;
  if (alerts.error) throw alerts.error;

  const alertByMealId = new Map<number, MealAlertRow>();
  for (const a of (alerts.data ?? []) as MealAlertRow[]) {
    alertByMealId.set(a.meal_id, a);
  }

  const result: { type: MealType; mealId: number; item: MealAlertItem }[] = [];
  for (const t of (times.data ?? []) as MealTimeRow[]) {
    const type = t.comment ? COMMENT_TO_TYPE[t.comment] : undefined;
    if (!type) continue;
    const alert = alertByMealId.get(t.id);
    const time = normalizeTime(alert?.alarm_time ?? t.alert_time);
    const range = TYPE_RANGE[type];
    result.push({
      type,
      mealId: t.id,
      item: {
        enabled: alert?.enabled ?? false,
        time,
        min: range.min,
        max: range.max,
      },
    });
  }
  return result;
}

export const getMealAlerts = async (): Promise<MealAlertsResponse> => {
  const joined = await fetchJoined();
  const success = joined.reduce(
    (acc, { type, item }) => {
      acc[type] = item;
      return acc;
    },
    {} as Record<MealType, MealAlertItem>,
  );
  return { resultType: "SUCCESS", error: null, success };
};

async function resolveMealIdMap(): Promise<Record<MealType, number>> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.from("meal_time").select("id, comment");
  if (error) throw error;
  const map: Partial<Record<MealType, number>> = {};
  for (const t of (data ?? []) as { id: number; comment: string | null }[]) {
    const type = t.comment ? COMMENT_TO_TYPE[t.comment] : undefined;
    if (type) map[type] = t.id;
  }
  return map as Record<MealType, number>;
}

export const patchMealAlerts = async (
  body: MealAlertPatchBody,
): Promise<MealAlertsResponse> => {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const mealIdMap = await resolveMealIdMap();

  const rows = (Object.keys(body) as MealType[]).flatMap((type) => {
    const update = body[type];
    if (!update) return [];
    const mealId = mealIdMap[type];
    if (!mealId) return [];
    return [
      {
        user_id: userId,
        meal_id: mealId,
        enabled: update.enabled ?? true,
        alarm_time: update.time ?? null,
      },
    ];
  });

  if (rows.length > 0) {
    const { error } = await sb
      .from("meal_alert")
      .upsert(rows, { onConflict: "user_id,meal_id" });
    if (error) throw error;
  }

  return getMealAlerts();
};

export const toggleMealAlerts = async (
  enabled: boolean,
): Promise<MealAlertToggleResponse> => {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const mealIdMap = await resolveMealIdMap();

  // meal_alert 행이 없으면 upsert로 생성, 있으면 enabled만 뒤집기
  const rows = Object.values(mealIdMap).map((mealId) => ({
    user_id: userId,
    meal_id: mealId,
    enabled,
  }));

  const { error } = await sb
    .from("meal_alert")
    .upsert(rows, { onConflict: "user_id,meal_id" });
  if (error) throw error;

  return { resultType: "SUCCESS", error: null, success: { enabled } };
};
