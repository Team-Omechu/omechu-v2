// OpenAPI spec 기반 먹부림 API 타입 정의

/** 기간 필터 옵션 */
export type MukburimPeriod =
  | "전체"
  | "1주"
  | "1개월"
  | "3개월"
  | "6개월"
  | "1년";

/** 정렬 기준 */
export type MukburimSortBy = "count" | "recent" | "oldest" | "name";

// ============ Statistics API ============

/** GET /menu/mukburim/statistics 요청 파라미터 */
export interface GetMukburimStatisticsParams {
  /** 조회 기간 (기본값: "1개월") */
  period?: MukburimPeriod;
  /** 시작 날짜 (YYYY-MM-DD, 커스텀 범위) */
  startDate?: string;
  /** 종료 날짜 (YYYY-MM-DD, 커스텀 범위) */
  endDate?: string;
  /** 정렬 기준 (기본값: "count") */
  sortBy?: MukburimSortBy;
}

/** 메뉴별 통계 아이템 */
export interface MukburimMenuStatistic {
  menu_name: string;
  image_link: string;
  count: number;
  last_eaten_at: string;
  last_eaten_date: string;
  last_eaten_display: string;
}

/** 통계 요약 정보 */
export interface MukburimStatisticsSummary {
  totalRecords: number;
  uniqueMenus: number;
  averagePerDay: number;
}

/** 날짜 범위 정보 */
export interface MukburimDateRange {
  startDate: string;
  endDate: string;
  displayRange: string;
}

/** 통계 조회 성공 응답 */
export interface MukburimStatisticsSuccess {
  period: MukburimPeriod;
  sortBy: MukburimSortBy;
  dateRange: MukburimDateRange;
  summary: MukburimStatisticsSummary;
  menuStatistics: MukburimMenuStatistic[];
}

/** GET /menu/mukburim/statistics 응답 */
export interface GetMukburimStatisticsResponse {
  resultType: "SUCCESS" | "FAIL";
  error: {
    errorCode: string;
    reason: string;
    data: unknown;
  } | null;
  success: MukburimStatisticsSuccess | null;
}

// ============ Calendar API ============

/** GET /menu/mukburim/calendar 요청 파라미터 */
export interface GetMukburimCalendarParams {
  /** 년도 */
  year: number;
  /** 월 (1-12) */
  month: number;
}

/** 캘린더 일자별 기록 아이템 */
export interface MukburimCalendarItem {
  id: string;
  menu_name: string;
  time: string;
}

/** 캘린더 데이터 (날짜 key → 기록 배열) */
export type MukburimCalendarData = Record<string, MukburimCalendarItem[]>;

/** 캘린더 조회 성공 응답 */
export interface MukburimCalendarSuccess {
  year: number;
  month: number;
  totalRecords: number;
  calendar: MukburimCalendarData;
}

/** GET /menu/mukburim/calendar 응답 */
export interface GetMukburimCalendarResponse {
  resultType: "SUCCESS" | "FAIL";
  error: {
    errorCode: string;
    reason: string;
    data: unknown;
  } | null;
  success: MukburimCalendarSuccess | null;
}

// ============ Date API ============

/** GET /menu/mukburim/date 요청 파라미터 */
export interface GetMukburimDateParams {
  /** 조회할 날짜 (YYYY-MM-DD) */
  date: string;
}

/** 특정 날짜 기록 아이템 */
export interface MukburimDateRecord {
  id: string;
  menu_name: string;
  time: string;
  created_at: string;
}

/** 특정 날짜 조회 성공 응답 */
export interface MukburimDateSuccess {
  date: string;
  displayDate: string;
  totalRecords: number;
  records: MukburimDateRecord[];
}

/** GET /menu/mukburim/date 응답 */
export interface GetMukburimDateResponse {
  resultType: "SUCCESS" | "FAIL";
  error: {
    errorCode: string;
    reason: string;
    data: unknown;
  } | null;
  success: MukburimDateSuccess | null;
}
