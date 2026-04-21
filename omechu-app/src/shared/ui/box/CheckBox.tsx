"use client";

import Image from "next/image";
import React, { forwardRef } from "react";

type CheckboxProps = {
  label: React.ReactNode;
  variant?: "square" | "round";
} & React.InputHTMLAttributes<HTMLInputElement>;

export const CheckBox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, variant = "square", ...props }, ref) => {
    const size = variant === "round" ? 18 : 17;

    return (
      <label htmlFor={id} className="flex cursor-pointer items-center">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <input
            type="checkbox"
            id={id}
            ref={ref}
            {...props}
            className="peer absolute h-full w-full cursor-pointer opacity-0"
          />

          {variant === "round" ? (
            <>
              {/* Round Unchecked */}
              <Image
                src="/auth/unchecked-round.svg"
                alt="unchecked"
                width={18}
                height={18}
                className="peer-checked:hidden"
              />
              {/* Round Checked */}
              <Image
                src="/auth/checked-round.svg"
                alt="checked"
                width={18}
                height={18}
                className="hidden peer-checked:block"
              />
            </>
          ) : (
            <>
              {/* Square Unchecked */}
              <Image
                src="/auth/unchecked-square.svg"
                alt="unchecked"
                width={17}
                height={17}
                className="peer-checked:hidden"
              />
              {/* Square Checked */}
              <Image
                src="/auth/checked-square.svg"
                alt="checked"
                width={17}
                height={17}
                className="hidden peer-checked:block"
              />
            </>
          )}
        </div>
        <span className="ml-2 text-sm">{label}</span>
      </label>
    );
  },
);

CheckBox.displayName = "Checkbox";
