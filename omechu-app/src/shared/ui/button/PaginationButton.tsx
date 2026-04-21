// ! 26.01.04 작업 완료
import Image from "next/image";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

const buttonContainerStyle = "w-12 h-14 flex flex-col gap-2 items-center";

const buttonLabelStyle = "text-caption-2-regular text-font-disabled";

const buttonStyles = cva(
  [
    "flex items-center justify-center",
    "w-[30px] h-[30px]",
    "bg-[#CACACA] opacity-100",
    "rounded-full transition-colors",
  ],
  {
    variants: {
      direction: {
        left: "",
        right: "",
      },
    },
  },
);

type ButtonProps = VariantProps<typeof buttonStyles> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { alt?: string };

export function PaginationButton({
  direction = "left",
  onClick,
  alt = "pagination button",
  className,
}: ButtonProps) {
  return (
    <button
      className={buttonContainerStyle}
      onClick={onClick}
      type="button"
      aria-label={direction === "left" ? "이전 페이지" : "다음 페이지"}
    >
      <div
        className={cn(buttonStyles({ direction }), className)}
        aria-hidden="true"
      >
        <Image
          src={"/arrow/pagination_arrow.svg"}
          alt={alt}
          width={7}
          height={10}
          style={{ width: "auto", height: "auto" }}
          className={direction === "left" ? "" : "scale-x-[-1]"}
        />
      </div>
      <span className={buttonLabelStyle}>
        {direction === "left" ? "이전" : "건너뛰기"}
      </span>
    </button>
  );
}
