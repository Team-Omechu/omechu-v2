import type {
  GetMukburimCalendarParams,
  GetMukburimCalendarResponse,
  GetMukburimDateParams,
  GetMukburimDateResponse,
  GetMukburimStatisticsParams,
  GetMukburimStatisticsResponse,
} from "@/entities/mukburim/model/mukburim.types";

import { axiosInstance } from "@/shared";

export const getMukburimStatistics = async (
  params?: GetMukburimStatisticsParams,
): Promise<GetMukburimStatisticsResponse> => {
  const { data } = await axiosInstance.get<GetMukburimStatisticsResponse>(
    "/menu/mukburim/statistics",
    { params },
  );
  return data;
};

export const getMukburimCalendar = async (
  params: GetMukburimCalendarParams,
): Promise<GetMukburimCalendarResponse> => {
  const { data } = await axiosInstance.get<GetMukburimCalendarResponse>(
    "/menu/mukburim/calendar",
    { params },
  );
  return data;
};

export const getMukburimByDate = async (
  params: GetMukburimDateParams,
): Promise<GetMukburimDateResponse> => {
  const { data } = await axiosInstance.get<GetMukburimDateResponse>(
    "/menu/mukburim/date",
    { params },
  );
  return data;
};
