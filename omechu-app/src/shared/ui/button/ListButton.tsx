import React from "react";

import { cn } from "@/shared/lib/cn.util";

type ListButtonProps = {
  isSelected: boolean;
  textSize?: "sm" | "base" | "lg" | "xl";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ListButton = ({
  isSelected,
  children,
  textSize = "xl",
  ...props
}: ListButtonProps) => {
  const baseStyle = `w-50 min-h-12 h-auto px-4 py-2 rounded-md border text-center flex items-center justify-center transition-colors text-${textSize}`;

  const selectedStyle =
    "bg-primary-normal text-white border-primary-normal active:bg-primary-normal-active";
  const unselectedStyle =
    "bg-white text-font-placeholder border-font-placeholder active:bg-white active:text-primary-normal active:border-primary-normal";

  return (
    <button
      {...props}
      className={cn(
        baseStyle,
        `text-${textSize}`,
        isSelected ? selectedStyle : unselectedStyle,
        props.className,
      )}
    >
      {children}
    </button>
  );
};
