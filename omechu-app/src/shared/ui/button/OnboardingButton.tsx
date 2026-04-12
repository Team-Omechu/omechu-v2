// ! 26.01.04 작업 완료

import React from "react";

import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

const OnboardingButtonStyles = cva(
  [
    "h-12 p-1",

    "flex items-center justify-center",
    "rounded-[10px]",
    "transition-all",
  ],
  {
    variants: {
      width: {
        xl: "w-[246px] text-body-2-regular",
        md: "w-[200px] text-body-3-regular",
        sm: "w-[120.5px] text-body-3-regular",
        xs: "w-[75.67px] text-body-3-regular",
      },
      selected: {
        true: "bg-brand-primary text-brand-secondary border-none",
        false:
          "bg-brand-secondary text-font-placeholder border border-font-placeholder",
      },
    },
    defaultVariants: {
      width: "xl",
    },
  },
);

type OnboardingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof OnboardingButtonStyles> & {
    selected?: boolean;
  };

export function OnboardingButton({
  width,
  selected = false,
  children,
  className,
  onClick,
  ...props
}: OnboardingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(OnboardingButtonStyles({ width, selected }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
