"use client";

import { twMerge } from "tailwind-merge";

import { ArrowUpIcon } from "@/shared/assets/icons/index";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
};

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      className={twMerge(
        "border-line-strong fixed bottom-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white pl-0.5 shadow-2xl",
        className,
      )}
      onClick={onClick}
    >
      <ArrowUpIcon className="w-4" />
    </button>
  );
}
