"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import { Header, ModalWrapper } from "@/shared";
import { ArrowIcon } from "@/shared/assets/icons";
import { TimePickerModal, ToggleSwitch } from "@/widgets/mypage/ui";

type MealType = "breakfast" | "lunch" | "dinner";

type MealAlarm = {
  type: MealType;
  enabled: boolean;
  time: string;
};

export default function AlarmSettingPage() {
  const router = useRouter();

  const [isAlarmFeatureEnabled, setIsAlarmFeatureEnabled] = useState(true);

  const [mealAlarms, setMealAlarms] = useState<MealAlarm[]>([
    { type: "breakfast", enabled: false, time: "07:30" },
    { type: "lunch", enabled: true, time: "11:30" },
    { type: "dinner", enabled: true, time: "18:00" },
  ]);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [tempTime, setTempTime] = useState<string>("");

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

    setMealAlarms((prev) =>
      prev.map((alarm) =>
        alarm.type === activeMealType
          ? { ...alarm, time: tempTime, enabled: true }
          : alarm,
      ),
    );

    handleCloseModal();
  };

  const _isMealAlarmEnabled = mealAlarms.some((alarm) => alarm.enabled);

  return (
    <>
      <Header
        title="알림 설정"
        onBackClick={() => router.push("/mypage")}
        showHomeButton={false}
      />

      <main className="relative mt-2 flex h-[80dvh] w-full flex-col pr-6 pl-8">
        <section className="mt-10 flex w-full flex-col items-start justify-start gap-3">
          <div className="flex w-full items-center justify-between">
            <span>식사 시간 알림</span>
            <ToggleSwitch
              checked={isAlarmFeatureEnabled}
              onChange={(value) => {
                setIsAlarmFeatureEnabled(value);
                if (!value) {
                  setMealAlarms((prev) =>
                    prev.map((alarm) => ({ ...alarm, enabled: false })),
                  );
                }
              }}
            />
          </div>
          <div className="text-caption-1-regular text-font-extra-low">
            매일 식사 시간마다 메뉴를 결정해 드려요.
          </div>
          {mealAlarms.map((alarm) => (
            <button
              key={alarm.type}
              disabled={!isAlarmFeatureEnabled}
              onClick={() => handleOpenTimeModal(alarm.type, alarm.time)}
              className={clsx(
                "flex w-full items-center justify-between",
                !isAlarmFeatureEnabled && "cursor-not-allowed",
              )}
            >
              <span>
                {alarm.type === "breakfast"
                  ? "아침 알림"
                  : alarm.type === "lunch"
                    ? "점심 알림"
                    : "저녁 알림"}
              </span>

              <div className="flex items-center gap-4">
                <span
                  className={
                    isAlarmFeatureEnabled && alarm.enabled
                      ? "text-brand-primary"
                      : "text-font-extra-low"
                  }
                >
                  {isAlarmFeatureEnabled && alarm.enabled ? alarm.time : "OFF"}
                </span>
                <ArrowIcon currentColor="#707070" />
              </div>
            </button>
          ))}
        </section>
      </main>
      {isTimeModalOpen && (
        <ModalWrapper>
          <TimePickerModal
            open={isTimeModalOpen}
            time={tempTime}
            onChangeTime={setTempTime}
            onConfirm={handleConfirmTime}
            onCancel={handleCloseModal}
          />
        </ModalWrapper>
      )}
    </>
  );
}
