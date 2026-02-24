"use client";

import React, { useMemo, useState } from "react";

import clsx from "clsx";

import {
  EMPTY_RANDOM_DRAW_SELECTION,
  RANDOM_DRAW_GROUPS,
  type RandomDrawGroupKey,
  type RandomDrawSelection,
} from "@/entities/randomDraw";
import { RandomDrawButton } from "@/shared";

type Props = {
  value?: RandomDrawSelection;
  defaultValue?: RandomDrawSelection;
  onSelectionChange?: (next: RandomDrawSelection) => void;
  className?: string;
  showDividers?: boolean;
};

export function RandomDrawSelector({
  value,
  defaultValue,
  onSelectionChange,
  className,
  showDividers = true,
}: Props) {
  const isControlled = value !== undefined;

  const [internal, setInternal] = useState<RandomDrawSelection>(
    defaultValue ?? EMPTY_RANDOM_DRAW_SELECTION,
  );

  const selection = isControlled ? value : internal;

  const setSelection = (
    updater: (prev: RandomDrawSelection) => RandomDrawSelection,
  ) => {
    const next = updater(selection);
    if (!isControlled) setInternal(next);
    onSelectionChange?.(next);
  };

  // ✅ 그룹 내 다중 선택 토글
  const toggleInGroup = (groupKey: RandomDrawGroupKey, itemValue: string) => {
    setSelection((prev) => {
      const currentArr = prev[groupKey];
      const exists = currentArr.includes(itemValue);

      const nextArr = exists
        ? currentArr.filter((v) => v !== itemValue)
        : [...currentArr, itemValue];

      return { ...prev, [groupKey]: nextArr };
    });
  };

  const rows = useMemo(() => RANDOM_DRAW_GROUPS, []);

  return (
    <div className={clsx("w-full max-w-90 p-2", className)}>
      {rows.map((group, idx) => {
        const isFirst = idx === 0;

        return (
          <div
            key={group.key}
            className={clsx(
              !isFirst &&
                showDividers &&
                "border-font-placeholder/80 mt-4 border-t pt-4",
            )}
          >
            <div className="flex flex-wrap justify-center gap-3">
              {group.options.map((opt) => {
                const selected = selection[group.key].includes(opt.value);

                return (
                  <RandomDrawButton
                    key={`${group.key}:${opt.value}`}
                    width={opt.width ?? "sm"}
                    selected={selected}
                    onClick={() => toggleInGroup(group.key, opt.value)}
                    aria-pressed={selected}
                  >
                    {opt.label}
                  </RandomDrawButton>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
