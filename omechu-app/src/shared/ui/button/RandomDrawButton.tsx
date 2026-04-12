// ! 26.01.06 작업 완료

import React from "react";

import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

const RandomDrawButtonStyles = cva(
  [
    "h-10",
    "flex items-center justify-center",
    "text-background-secondary text-caption-1-regular",
    "rounded-xl",
    "active:bg-statelayer-pressed active:text-brand-secondary",
    "transition-all",
  ],
  {
    variants: {
      width: {
        md: "w-[125px]",
        sm: "w-[50px]",
      },
      selected: {
        true: "bg-brand-primary text-brand-secondary border-none",
        false:
          "bg-brand-secondary text-font-placeholder border border-font-placeholder ",
      },
    },
    defaultVariants: {
      width: "sm",
    },
  },
);

type RandomDrawButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof RandomDrawButtonStyles> & {
    selected?: boolean;
  };

export function RandomDrawButton({
  width,
  selected = false,
  children,
  className,
  onClick,
  ...props
}: RandomDrawButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(RandomDrawButtonStyles({ width, selected }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
