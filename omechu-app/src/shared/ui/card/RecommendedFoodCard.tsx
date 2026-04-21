// ! 26.01.04 작업 완료
import Image from "next/image";

import { cn } from "@/shared/lib/cn.util";

interface RecommendedFoodCardProps {
  menuDesc: string;
  menuTitle: string;
  selected?: boolean;
  src?: string;
  onCardClick: () => void;
}

export function RecommendedFoodCard({
  selected,
  onCardClick,
  menuTitle,
  menuDesc,
  src,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & RecommendedFoodCardProps) {
  return (
    <div className="relative">
      <button
        onClick={onCardClick}
        className={cn(
          "bg-brand-secondary border-font-disabled flex h-28 w-84 gap-5 rounded-2xl border-[1.5px] p-3",
          selected && "border-font-high",
        )}
        aria-label="추천 음식 카드"
        aria-pressed={selected}
        type="button"
      >
        <div className="flex h-22 w-22 items-center justify-center rounded-2xl">
          <Image
            src={src || "/image/image_empty.svg"}
            width={96}
            height={96}
            alt="추천 음식 미리보기 이미지"
            className="rounded-2xl object-cover"
            loading="eager"
            priority
          />
        </div>
        <div className="w-48 text-left">
          <div className="text-body-4-medium text-font-high mt-1 mb-2">
            {menuTitle}
          </div>
          <p className="text-caption-1-regular text-font-placeholder line-clamp-3 leading-tight">
            {menuDesc}
          </p>
        </div>
      </button>
    </div>
  );
}
