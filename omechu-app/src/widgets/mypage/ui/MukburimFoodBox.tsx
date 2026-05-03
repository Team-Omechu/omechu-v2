"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/image/image_empty.svg";

interface MukburimFoodBoxProps {
  src: string;
  title: string;
  frequency: string;
}

export function MukburimFoodBox({
  src,
  frequency = "0",
  title,
}: MukburimFoodBoxProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  return (
    <div className="relatvie bg-brand-secondary relative h-25 w-25 rounded-xl transition-all">
      <span className="text-body-4-medium text-font-high absolute top-1 left-1/2 -translate-x-1/2">
        {frequency} 회
      </span>
      <Image
        src={imgSrc}
        alt={`${title} 메뉴 이미지`}
        width={100}
        height={100}
        sizes="80px"
        loading="lazy"
        unoptimized={false}
        className="rounded-xl object-fill"
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />
      <span className="text-body-4-medium text-font-high absolute bottom-1 left-1/2 w-full -translate-x-1/2 text-center">
        {title}
      </span>
    </div>
  );
}
