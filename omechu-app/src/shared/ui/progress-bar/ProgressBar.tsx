import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

const containerStyle = cva("flex justify-center w-full px-5", {
  variants: {},
});

const segmentStyle = cva("h-[9px] rounded-[30px] border border-brand-primary", {
  variants: {
    filled: {
      true: "bg-brand-primary border",
      false: "bg-brand-secondary",
    },
  },
});

export function ProgressBar({
  currentStep,
  totalSteps,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn(containerStyle(), className)}>
      <div className="flex w-full justify-center gap-1.5 pb-2.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex-1",
              segmentStyle({ filled: index < currentStep }),
            )}
          />
        ))}
      </div>
    </div>
  );
}
