"use client";

import clsx from "clsx";

const PERIOD_OPTIONS = [
  "직접입력",
  "전체",
  "1주",
  "1개월",
  "3개월",
  "6개월",
  "1년",
] as const;

interface PeriodTapProps {
  value: Period;
  onChange: (period: Period) => void;
}

type Period = (typeof PERIOD_OPTIONS)[number];

export function PeriodTap({ value, onChange }: PeriodTapProps) {
  return (
    <section className="h-fit overflow-x-auto px-5 pb-2.5">
      <div className="border-font-extra-low relative flex h-full w-max flex-nowrap items-end gap-4 border-b">
        {PERIOD_OPTIONS.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={clsx(
              "shrink-0 px-1.75 pb-2.5 whitespace-nowrap",
              value === item
                ? "text-caption-1-medium border-foundation-grey-darker text-grey-darker relative top-px border-b-2"
                : "text-body-4-medium text-font-extra-low",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
