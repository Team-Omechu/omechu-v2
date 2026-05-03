"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { TimePickerModal, ToggleSwitch } from "@/widgets/mypage";

import type {
  MealAlertItem,
  MealAlertPatchBody,
  MealType,
} from "@/entities/alarm";
import {
  getMealAlerts,
  patchMealAlerts,
  toggleMealAlerts,
} from "@/entities/alarm";

import { ArrowIcon } from "@/shared/assets/icons";

import { ContentLoading, Header, ModalWrapper } from "@/shared";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침 알림",
  lunch: "점심 알림",
  dinner: "저녁 알림",
  night: "야식 알림",
};

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "night"];

export default function AlarmSettingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [tempTime, setTempTime] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "meal-alerts"],
    queryFn: getMealAlerts,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const alerts = data?.success;
  const masterEnabled = alerts
    ? Object.values(alerts).some((a) => a.enabled)
    : false;

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => toggleMealAlerts(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "meal-alerts"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: (body: MealAlertPatchBody) => patchMealAlerts(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "meal-alerts"] });
    },
  });

  const handleOpenTimeModal = (type: MealType, currentTime: string) => {
    setActiveMealType(type);
    setTempTime(currentTime);
    setIsTimeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTimeModalOpen(false);
    setActiveMealType(null);
    setTempTime("");
  };

  const handleConfirmTime = () => {
    if (!activeMealType) return;
    patchMutation.mutate(
      { [activeMealType]: { enabled: true, time: tempTime } },
      { onSuccess: handleCloseModal },
    );
  };

  const handleTurnOff = () => {
    if (!activeMealType) return;
    patchMutation.mutate(
      { [activeMealType]: { enabled: false } },
      { onSuccess: handleCloseModal },
    );
  };

  const activeAlert: MealAlertItem | undefined =
    activeMealType && alerts ? alerts[activeMealType] : undefined;

  return (
    <>
      <Header
        title="알림 설정"
        onBackClick={() => router.push("/mypage")}
        showHomeButton={false}
      />

      {isLoading ? (
        <main className="mt-2 flex h-[80dvh] w-full">
          <ContentLoading />
        </main>
      ) : isError || !alerts ? (
        <main className="mt-2 flex h-[80dvh] w-full items-center justify-center">
          <span className="text-font-low text-body-3-regular">
            알림 설정을 불러올 수 없습니다.
          </span>
        </main>
      ) : (
        <main className="relative mt-2 flex h-[80dvh] w-full flex-col pr-6 pl-8">
          <section className="mt-10 flex w-full flex-col items-start justify-start gap-3">
            <div className="flex w-full items-center justify-between">
              <span>식사 시간 알림</span>
              <ToggleSwitch
                checked={masterEnabled}
                onChange={(value) => toggleMutation.mutate(value)}
              />
            </div>
            <div className="text-caption-1-regular text-font-extra-low">
              매일 식사 시간마다 메뉴를 결정해 드려요.
            </div>
            {MEAL_ORDER.map((type) => {
              const alarm = alerts[type];
              return (
                <button
                  key={type}
                  disabled={!masterEnabled}
                  onClick={() => handleOpenTimeModal(type, alarm.time)}
                  className={clsx(
                    "flex w-full items-center justify-between",
                    !masterEnabled && "cursor-not-allowed",
                  )}
                >
                  <span>{MEAL_LABELS[type]}</span>
                  <div className="flex items-center gap-4">
                    <span
                      className={
                        masterEnabled && alarm.enabled
                          ? "text-brand-primary"
                          : "text-font-extra-low"
                      }
                    >
                      {masterEnabled && alarm.enabled ? alarm.time : "OFF"}
                    </span>
                    <ArrowIcon currentColor="#707070" />
                  </div>
                </button>
              );
            })}
          </section>
        </main>
      )}

      {isTimeModalOpen && (
        <ModalWrapper>
          <TimePickerModal
            open={isTimeModalOpen}
            time={tempTime}
            onChangeTime={setTempTime}
            onConfirm={handleConfirmTime}
            onCancel={handleCloseModal}
            onOff={handleTurnOff}
            min={activeAlert?.min}
            max={activeAlert?.max}
          />
        </ModalWrapper>
      )}
    </>
  );
}
