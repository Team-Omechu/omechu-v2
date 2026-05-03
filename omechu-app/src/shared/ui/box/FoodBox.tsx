//! 26.01.06 작업 완료

"use client";

import Image from "next/image";

import { cn } from "@/shared/lib/cn";

interface FoodBoxProps {
  src: string;
  title: string;
  isSelected: boolean;
  onClick?: () => void;
}

export function FoodBox({
  src,
  title,
  isSelected = false,
  onClick,
}: FoodBoxProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${title} 선택 버튼`}
      className={cn(
        "bg-brand-secondary h-25 w-25 rounded-xl transition-all",
        isSelected ? "border-brand-primary border-2" : "",
      )}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-between rounded-2xl p-2",
          isSelected ? "bg-brand-secondary opacity-40" : "",
        )}
      >
        <figure className="flex h-16 w-16 items-center">
          <Image
            src={src || "/image/image_empty.svg"}
            alt={`${title} 메뉴 이미지`}
            width={70}
            height={70}
            className="rounded-xl object-fill"
          />
        </figure>
        <figcaption className="text-caption-1-medium text-font-high">
          {title}
        </figcaption>
      </div>
    </button>
  );
}
