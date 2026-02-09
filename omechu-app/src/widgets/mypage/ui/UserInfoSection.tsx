//! 26.01.12 작업 중
// TODO : onClick 수정

"use client";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import { HistoryRoundedIcon, WriteIcon } from "@/shared/assets/icons/index";

interface UserInfoSectionProps {
  name: string;
  exerciseStatus: string;
  favoriteFood: string;
  allergy: string;
  onNicknameClick: () => void;
}

export function UserInfoSection({
  name,
  exerciseStatus,
  favoriteFood,
  allergy,
  onNicknameClick,
}: UserInfoSectionProps) {
  const router = useRouter();

  return (
    <section
      className={clsx(
        "flex flex-col",
        "h-fit w-84",
        "bg-background-secondary border-font-placeholder rounded-xl border",
      )}
    >
      <div className="border-font-placeholder flex h-fit w-full flex-col gap-2.5 border-b px-6 py-4">
        <div className="flex justify-between">
          <span className="text-body-3-bold">
            <span className="text-body-3-bold relative mr-4.5">
              {name}
              <button onClick={onNicknameClick}>
                <WriteIcon className="absolute -top-1 -right-4 w-3.5" />
              </button>
            </span>
            <span className="text-body-4-medium">의 기본 상태</span>
          </span>
          <button
            onClick={() => router.push("mypage/basic-state")}
            className="text-font-placeholder text-caption-1-medium"
          >
            다시 입력하기
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="text-font-high text-body-4-regular w-16">
              운동 상태
            </span>
            <span>|</span>
            <span className="text-brand-primary text-body-4-medium h-fit w-50 whitespace-pre-line">
              {exerciseStatus}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-font-high text-body-4-regular w-16">
              선호 음식
            </span>
            <span>|</span>
            <span className="text-brand-primary text-body-4-medium h-fit w-50 whitespace-pre-line">
              {favoriteFood}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-font-high text-body-4-regular mr-1 w-15">
              알레르기
            </span>
            <span>|</span>
            <span className="text-brand-primary text-body-4-medium h-fit w-50 whitespace-pre-line">
              {allergy}
            </span>
          </div>
        </div>
      </div>

      <div className="text-font-high text-body-4-medium flex w-full">
        <button
          onClick={() => router.push("/mypage/recommended-list")}
          className="border-font-placeholder flex h-14 w-42 flex-1 items-center justify-center gap-2 border-r"
        >
          <div className="border-font-extra-low flex h-5 w-5 items-center justify-center rounded-full border">
            <WriteIcon className="text-font-extra-low w-3" />
          </div>
          <span>추천 목록 관리</span>
        </button>
        <button
          onClick={() => router.push("/mypage/mukburim-log")}
          className="flex h-14 w-42 items-center justify-center gap-2"
        >
          <div className="border-font-extra-low flex h-5 w-5 items-center justify-center rounded-full border">
            <HistoryRoundedIcon className="text-font-extra-low mt-px ml-px w-3.5" />
          </div>
          <span>먹부림 기록</span>
        </button>
      </div>
    </section>
  );
}
