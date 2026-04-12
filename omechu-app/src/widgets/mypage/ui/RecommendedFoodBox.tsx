//! 26.01.12 작업 완료

"use client";

import Image from "next/image";

import { CirclePlus, CircleMinus } from "@/shared/assets/icons/index";

interface RecommendedFoodBoxProps {
  src: string;
  title: string;
  onClick?: () => void;
  isToggled: boolean;
}

export function RecommendedFoodBox({
  src,
  title,
  onClick,
  isToggled,
}: RecommendedFoodBoxProps) {
  return (
    <div
      aria-label={`${title} 선택 버튼`}
      onClick={onClick}
      className="bg-brand-secondary relative h-25 w-25 rounded-xl transition-all"
    >
      <button className="absolute top-1 right-1">
        {isToggled ? (
          <CirclePlus className="w-5" currentColor="#A8A8A8" />
        ) : (
          <CircleMinus className="w-5" currentColor="#A8A8A8" />
        )}
      </button>

      <div className="flex h-full w-full flex-col items-center justify-between rounded-2xl p-2">
        <figure className="flex h-16 w-16 items-center">
          <Image
            src={src || "/image/image_empty.svg"}
            alt={`${title} 메뉴 이미지`}
            width={80}
            height={80}
            sizes="80px"
            loading="lazy"
            unoptimized={false}
            className="rounded-xl object-fill"
          />
        </figure>
        <figcaption className="text-body-4-medium text-font-high">
          {title}
        </figcaption>
      </div>
    </div>
  );
}
