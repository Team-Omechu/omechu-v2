//! 26.01.13 작업
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SelectTabProps = {
  tabs: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function SelectTab({
  tabs,
  selectedIndex,
  onSelect,
  className,
}: SelectTabProps) {
  return (
    <section
      className={twMerge(
        "bg-brand-secondary flex w-84.5 gap-2 rounded-xl p-1.25",
        className,
      )}
    >
      {tabs.map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={twMerge(
            clsx(
              "text-body-4-medium h-12 w-39 rounded-lg p-2.5 transition-all duration-300",
              selectedIndex === index
                ? "bg-brand-primary text-brand-secondary"
                : "text-font-medium",
            ),
          )}
        >
          {item}
        </button>
      ))}
    </section>
  );
}
