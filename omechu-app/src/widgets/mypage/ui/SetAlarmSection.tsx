"use client";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { getMealAlerts } from "@/entities/alarm";
import { ArrowIcon } from "@/shared/assets/icons/index";

export function SetAlarmSection() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["user", "meal-alerts"],
    queryFn: getMealAlerts,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const alerts = data?.success;
  const isAlarmOn = alerts
    ? Object.values(alerts).some((a) => a.enabled)
    : false;

  return (
    <section
      className={clsx(
        "relative flex flex-col gap-2",
        "px-6 py-3",
        "h-fit w-84",
        "bg-background-secondary border-font-placeholder rounded-xl border",
      )}
    >
      <div className="text-body-3-medium text-font-high">알림 설정</div>
      <div className="flex w-full justify-between">
        <span className="text-body-4-regular text-font-low w-fit">
          식사 시간 알림
        </span>
        <span className="flex w-fit items-center gap-4">
          <span className="text-body-4-medium text-brand-primary pr-4">
            {isAlarmOn ? "ON" : "OFF"}
          </span>
        </span>
      </div>
      <button
        className="absolute right-4 bottom-4"
        onClick={() => router.push("/mypage/alarm-setting")}
      >
        <ArrowIcon className="text-font-extra-low" width={9} height={15} />
      </button>
    </section>
  );
}
