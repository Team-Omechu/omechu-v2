import type {
  GetMukburimCalendarParams,
  GetMukburimCalendarResponse,
  GetMukburimDateParams,
  GetMukburimDateResponse,
  GetMukburimStatisticsParams,
  GetMukburimStatisticsResponse,
  MukburimCalendarData,
  MukburimCalendarItem,
  MukburimDateRecord,
  MukburimMenuStatistic,
  MukburimPeriod,
} from "@/entities/mukburim/model/mukburim.types";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface MukburimRowWithMenu {
  id: number;
  eaten_at: string;
  menu: {
    id: number;
    name: string;
    image_link: string | null;
  } | null;
}

async function getAuthedUserId(): Promise<string> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("unauthorized");
  return data.user.id;
}

function startOfPeriod(period: MukburimPeriod): Date {
  const now = new Date();
  const d = new Date(now);
  switch (period) {
    case "1주":
      d.setDate(d.getDate() - 7);
      return d;
    case "1개월":
      d.setMonth(d.getMonth() - 1);
      return d;
    case "3개월":
      d.setMonth(d.getMonth() - 3);
      return d;
    case "6개월":
      d.setMonth(d.getMonth() - 6);
      return d;
    case "1년":
      d.setFullYear(d.getFullYear() - 1);
      return d;
    case "전체":
    default:
      return new Date("1970-01-01T00:00:00Z");
  }
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatRelative(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffDay <= 0) return "오늘";
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  return formatDisplay(d);
}

// ============ Statistics ============

export const getMukburimStatistics = async (
  params?: GetMukburimStatisticsParams,
): Promise<GetMukburimStatisticsResponse> => {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const period: MukburimPeriod = params?.period ?? "1개월";
  const sortBy = params?.sortBy ?? "count";

  const start = params?.startDate
    ? new Date(params.startDate)
    : startOfPeriod(period);
  const end = params?.endDate ? new Date(params.endDate) : new Date();

  const { data, error } = await sb
    .from("mukburim")
    .select("id, eaten_at, menu:menu_id(id, name, image_link)")
    .eq("user_id", userId)
    .gte("eaten_at", start.toISOString())
    .lte("eaten_at", end.toISOString());

  if (error) throw error;

  const rows = (data ?? []) as unknown as MukburimRowWithMenu[];

  const byMenu = new Map<
    string,
    { image: string; count: number; lastEatenAt: Date }
  >();
  for (const r of rows) {
    if (!r.menu) continue;
    const key = r.menu.name;
    const eatenAt = new Date(r.eaten_at);
    const existing = byMenu.get(key);
    if (!existing) {
      byMenu.set(key, {
        image: r.menu.image_link ?? "",
        count: 1,
        lastEatenAt: eatenAt,
      });
    } else {
      existing.count += 1;
      if (eatenAt > existing.lastEatenAt) existing.lastEatenAt = eatenAt;
    }
  }

  const stats: MukburimMenuStatistic[] = Array.from(byMenu.entries()).map(
    ([menu_name, v]) => ({
      menu_name,
      image_link: v.image,
      count: v.count,
      last_eaten_at: v.lastEatenAt.toISOString(),
      last_eaten_date: formatYMD(v.lastEatenAt),
      last_eaten_display: formatRelative(v.lastEatenAt),
    }),
  );

  stats.sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.last_eaten_at).getTime() -
          new Date(a.last_eaten_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.last_eaten_at).getTime() -
          new Date(b.last_eaten_at).getTime()
        );
      case "name":
        return a.menu_name.localeCompare(b.menu_name, "ko");
      case "count":
      default:
        return b.count - a.count;
    }
  });

  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000),
  );

  return {
    resultType: "SUCCESS",
    error: null,
    success: {
      period,
      sortBy,
      dateRange: {
        startDate: formatYMD(start),
        endDate: formatYMD(end),
        displayRange: `${formatDisplay(start)} ~ ${formatDisplay(end)}`,
      },
      summary: {
        totalRecords: rows.length,
        uniqueMenus: byMenu.size,
        averagePerDay: Number((rows.length / days).toFixed(2)),
      },
      menuStatistics: stats,
    },
  };
};

// ============ Calendar ============

export const getMukburimCalendar = async (
  params: GetMukburimCalendarParams,
): Promise<GetMukburimCalendarResponse> => {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const { year, month } = params;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const { data, error } = await sb
    .from("mukburim")
    .select("id, eaten_at, menu:menu_id(id, name, image_link)")
    .eq("user_id", userId)
    .gte("eaten_at", start.toISOString())
    .lt("eaten_at", end.toISOString())
    .order("eaten_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as MukburimRowWithMenu[];

  const calendar: MukburimCalendarData = {};
  for (const r of rows) {
    if (!r.menu) continue;
    const d = new Date(r.eaten_at);
    const key = formatYMD(d);
    const item: MukburimCalendarItem = {
      id: String(r.id),
      menu_name: r.menu.name,
      time: formatTime(d),
    };
    if (!calendar[key]) calendar[key] = [];
    calendar[key].push(item);
  }

  return {
    resultType: "SUCCESS",
    error: null,
    success: {
      year,
      month,
      totalRecords: rows.length,
      calendar,
    },
  };
};

// ============ Date ============

export const getMukburimByDate = async (
  params: GetMukburimDateParams,
): Promise<GetMukburimDateResponse> => {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const { date } = params;

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  const { data, error } = await sb
    .from("mukburim")
    .select("id, eaten_at, menu:menu_id(id, name, image_link)")
    .eq("user_id", userId)
    .gte("eaten_at", start.toISOString())
    .lte("eaten_at", end.toISOString())
    .order("eaten_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as MukburimRowWithMenu[];

  const records: MukburimDateRecord[] = rows
    .filter((r) => r.menu)
    .map((r) => {
      const d = new Date(r.eaten_at);
      return {
        id: String(r.id),
        menu_name: r.menu!.name,
        time: formatTime(d),
        created_at: r.eaten_at,
      };
    });

  const display = new Date(`${date}T00:00:00`);
  return {
    resultType: "SUCCESS",
    error: null,
    success: {
      date,
      displayDate: formatDisplay(display),
      totalRecords: records.length,
      records,
    },
  };
};
