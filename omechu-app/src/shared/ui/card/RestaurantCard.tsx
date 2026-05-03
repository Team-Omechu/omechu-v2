"use client";

import Image from "next/image";

interface RestaurantCardProps {
  name: string;
  distance: string;
  category: string;
  price: string;
  address: string;
  image?: string;
  onCardClick?: () => void;
}

export function RestaurantCard({
  name,
  distance,
  category,
  price,
  address,
  image,
  onCardClick,
}: RestaurantCardProps) {
  return (
    <div
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${name} 카드`}
      className="bg-background-secondary flex h-fit w-81.5 justify-between rounded-2xl p-4"
    >
      <div className="flex w-52 flex-col gap-1">
        <div className="flex gap-1">
          <span className="text-body-4-medium text-font-high">{name}</span>
          <span>|</span>
          <span className="text-body-4-regular text-brand-primary">
            {`${distance}m`}
          </span>
        </div>
        <div className="text-body-4-regular text-font-extra-low flex gap-1">
          <span className="w-fit">{category}</span>
          <span>·</span>
          <span>{`￦ ${price}`}</span>
        </div>
        <div className="text-body-4-regular text-font-extra-low flex">
          <span className="text-left whitespace-pre-line">{address}</span>
        </div>
      </div>
      <div className="relative h-20 w-20 overflow-hidden">
        <Image
          src={image || "/image/image_empty.svg"}
          alt={`${name} 이미지`}
          fill
          sizes="80px"
          priority
          className="rounded-xl object-cover"
        />
      </div>
    </div>
  );
}
