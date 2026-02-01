"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { format } from "date-fns";

import {
  getMukburimStatistics,
  type MukburimPeriod,
  type MukburimSortBy,
} from "@/entities/mukburim";
import { PERIOD_OPTIONS } from "@/shared/constants/mypage";
import { Header } from "@/shared/index";
import {
  MukburimFoodBox,
  PeriodTap,
  CustomDatePicker,
} from "@/widgets/mypage/ui";

type Period = (typeof PERIOD_OPTIONS)[number];

type SortOrder = "MostLogged" | "LatestLogged";

const SORT_ORDER_MAP: Record<SortOrder, MukburimSortBy> = {
  MostLogged: "count",
  LatestLogged: "recent",
};

const periodToApiPeriod = (period: Period): MukburimPeriod | undefined => {
  if (period === "직접입력") return undefined;
  return period as MukburimPeriod;
};

export default function MukburimLogPage() {
  const router = useRouter();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("전체");
  const [sortOrder, setSortOrder] = useState<SortOrder>("MostLogged");
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const apiParams = useMemo(() => {
    const params: {
      period?: MukburimPeriod;
      startDate?: string;
      endDate?: string;
      sortBy: MukburimSortBy;
    } = {
      sortBy: SORT_ORDER_MAP[sortOrder],
    };

    if (selectedPeriod === "직접입력") {
      if (range.startDate) {
        params.startDate = format(range.startDate, "yyyy-MM-dd");
      }
      if (range.endDate) {
        params.endDate = format(range.endDate, "yyyy-MM-dd");
      }
    } else {
      params.period = periodToApiPeriod(selectedPeriod);
    }

    return params;
  }, [selectedPeriod, sortOrder, range]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mukburim-statistics", apiParams],
    queryFn: () => getMukburimStatistics(apiParams),
    staleTime: 1000 * 60 * 5,
  });

  const menuStatistics = data?.success?.menuStatistics ?? [];

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    if (period !== "직접입력") {
      setRange({ startDate: null, endDate: null });
    }
  };

  const handleDateRangeChange = useCallback(
    (s: Date | null, e: Date | null) => {
      setRange((prev) => {
        const next = { startDate: s, endDate: e };
        return prev.startDate === next.startDate &&
          prev.endDate === next.endDate
          ? prev
          : next;
      });
    },
    [],
  );

  return (
    <>
      <Header title="먹부림 기록" onBackClick={() => router.push("/mypage")} />
      <PeriodTap value={selectedPeriod} onChange={handlePeriodChange} />
      {selectedPeriod === "직접입력" && (
        <section className="-mt-1 flex h-fit w-full items-center justify-between border-t px-6 py-3">
          <CustomDatePicker onChange={handleDateRangeChange} />
        </section>
      )}
      <main className="flex flex-col items-center">
        <div>
          <section className="text-caption-2-medium mt-2 mb-3 flex w-full justify-end gap-2">
            <button
              className={
                sortOrder === "MostLogged"
                  ? "text-font-high"
                  : "text-font-extra-low"
              }
              onClick={() => setSortOrder("MostLogged")}
            >
              많이 먹은 순
            </button>
            <span>|</span>
            <button
              className={
                sortOrder === "LatestLogged"
                  ? "text-font-high"
                  : "text-font-extra-low"
              }
              onClick={() => setSortOrder("LatestLogged")}
            >
              최근 먹은 순
            </button>
          </section>

          {isLoading && (
            <section className="grid grid-cols-3 gap-4.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-brand-secondary h-25 w-25 animate-pulse rounded-xl"
                />
              ))}
            </section>
          )}

          {isError && (
            <p className="text-body-3-medium text-font-low py-10 text-center">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
          )}

          {!isLoading && !isError && menuStatistics.length === 0 && (
            <p className="text-body-3-medium text-font-low py-10 text-center">
              해당 기간에 먹부림 기록이 없습니다.
            </p>
          )}

          {!isLoading && !isError && menuStatistics.length > 0 && (
            <section className="grid grid-cols-3 gap-4.5">
              {menuStatistics.map((item) => (
                <MukburimFoodBox
                  key={item.menu_name}
                  frequency={String(item.count)}
                  src="/image/image_empty.svg"
                  title={item.menu_name}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
