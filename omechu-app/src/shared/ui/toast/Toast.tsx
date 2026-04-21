// ! 26.01.04 작업 완료
import Image from "next/image";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

const toastStyles = cva(
  [
    "fixed left-1/2 -translate-x-1/2 z-50",
    "px-4 py-3 rounded-xl shadow-lg",
    "rounded-[10px] bg-font-disabled",
    "text-caption-1-medium text-brand-secondary whitespace-pre-wrap",
    "transition-opacity duration-300 ease-in-out",
  ],
  {
    variants: {
      state: {
        error: "w-[314px]",
        success: "w-[350px]",
      },
      show: {
        true: "opacity-100 animate-shake",
        false: "opacity-0",
      },
    },
  },
);

export type ToastStyleProps = VariantProps<typeof toastStyles>;

export function Toast({
  message,
  state = "error",
  show,
  className,
}: {
  message: string;
  state?: "error" | "success";
  show: boolean;
  className?: string;
}) {
  return (
    <div className={cn(toastStyles({ state, show }), className)}>
      {state === "success" && (
        <span className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2">
          <Image
            src="/circle/circle_correct.svg"
            alt="success icon"
            width="18"
            height="18"
          />
        </span>
      )}
      <div
        className={cn(
          state === "error" ? "flex w-full justify-center text-center" : "",
        )}
      >
        <div
          className={cn(
            "w-full whitespace-pre-line",
            state === "success" ? "ml-8" : "",
          )}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
