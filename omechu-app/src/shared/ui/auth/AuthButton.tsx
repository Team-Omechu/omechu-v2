"use client";

import * as React from "react";

import Image from "next/image";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

/**
 * AuthButton
 * - 기존 Button 컴포넌트 스타일을 확장한 소셜 로그인 버튼
 * - 아이콘 지원 (카카오, 구글 등)
 * - 추후 Button 컴포넌트에 통합 예정
 */
const authButtonStyles = cva(
  [
    // 기존 Button과 동일한 기본 스타일
    "h-12",
    "rounded-[10px]",
    "flex items-center justify-center",
    "text-body-4-regular",
    "w-full", // auth 페이지에서는 항상 full width

    // 인터랙션
    "disabled:cursor-not-allowed disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        // 기존 Button의 default와 동일
        primary: [
          "bg-statelayer-default text-brand-secondary",
          "active:bg-statelayer-pressed",
        ],
        // 소셜 로그인용 variants
        kakao: ["bg-[#FDDC3F] text-font-high", "active:bg-[#eacc2f]"],
        google: ["bg-[#F2F2F2] text-font-high", "active:bg-[#dedede]"],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

interface AuthButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof authButtonStyles> {
  icon?: string;
  iconAlt?: string;
  isLoading?: boolean;
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      children,
      variant,
      icon,
      iconAlt = "",
      isLoading,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(authButtonStyles({ variant }), className)}
        {...props}
      >
        {icon && (
          <Image
            src={icon}
            alt={iconAlt}
            width={24}
            height={24}
            className="mr-2"
          />
        )}
        {isLoading ? "로딩 중..." : children}
      </button>
    );
  },
);

AuthButton.displayName = "AuthButton";
