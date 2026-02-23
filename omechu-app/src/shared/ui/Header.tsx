"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

import { BaseModal } from "./modal/BaseModal";
import { ModalWrapper } from "./modal/ModalWrapper";

const headerStyles = cva(
  ["flex items-center justify-between", "w-full", "px-5 pt-5 pb-2.5"],
  {
    variants: {
      variant: {
        default: "",
        mypage: "justify-end",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type HeaderProps = VariantProps<typeof headerStyles> & {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showProfileButton?: boolean;

  // ✅ 공유 UI만 제공 (로직은 바깥에서)
  showShareButton?: boolean;
  onShareClick?: () => void;

  // ✅ 뒤로/홈 버튼을 “선택적으로” 가로채기 위한 핸들러
  onBackClick?: () => void;
  onHomeClick?: () => void;

  homeModalTitle?: string;
  homeModalLeftText?: string;
  homeModalRightText?: string;

  className?: string;
};

export const Header = ({
  variant = "default",
  title,
  showBackButton = true,
  showHomeButton = true,
  showProfileButton = false,

  showShareButton = false,
  onShareClick,

  onBackClick,
  onHomeClick,
  homeModalTitle = "홈으로 돌아가시겠어요?",
  homeModalLeftText = "네",
  homeModalRightText = "아니요",
  className,
}: HeaderProps) => {
  const router = useRouter();
  const [showHomeModal, setShowHomeModal] = useState(false);

  const handleBack = () => {
    if (onBackClick) onBackClick();
    else router.back();
  };

  const handleHomeConfirm = () => {
    setShowHomeModal(false);
    router.push("/mainpage");
  };

  // mypage variant: 프로필 아이콘만 표시
  if (variant === "mypage") {
    return (
      <header className={cn(headerStyles({ variant }), className)}>
        <Link href="/mypage" aria-label="마이페이지">
          <Image src="/header/person.svg" alt="" width={24} height={24} />
        </Link>
      </header>
    );
  }

  return (
    <>
      <header className={cn(headerStyles({ variant }), className)}>
        {/* 왼쪽: 뒤로가기 버튼 */}
        {showBackButton ? (
          <button
            type="button"
            onClick={handleBack}
            className="shrink-0"
            aria-label="뒤로가기"
          >
            <Image
              src="/header/chevron-left.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        {/* 중앙: 타이틀 */}
        <div className="mx-2 flex-1">
          {title && (
            <p className="text-body-3-medium text-font-high text-center">
              {title}
            </p>
          )}
        </div>

        {/* 오른쪽: 공유 + 홈/프로필 */}
        <div className="flex shrink-0 items-center gap-3">
          {showShareButton && (
            <button
              type="button"
              onClick={onShareClick}
              aria-label="공유하기"
              className="shrink-0"
            >
              <Image src="/share/share.svg" alt="" width={24} height={24} />
            </button>
          )}

          {showHomeButton ? (
            <button
              type="button"
              onClick={onHomeClick ?? (() => setShowHomeModal(true))}
              aria-label="홈으로"
              className="shrink-0"
            >
              <Image src="/header/home.svg" alt="" width={24} height={24} />
            </button>
          ) : showProfileButton ? (
            <Link href="/mypage" aria-label="마이페이지" className="shrink-0">
              <Image src="/header/person.svg" alt="" width={24} height={24} />
            </Link>
          ) : (
            <div className="w-6 shrink-0" />
          )}
        </div>
      </header>

      {showHomeModal && (
        <ModalWrapper>
          <BaseModal
            title={homeModalTitle}
            leftButtonText={homeModalLeftText}
            rightButtonText={homeModalRightText}
            onCloseClick={() => setShowHomeModal(false)}
            onLeftButtonClick={handleHomeConfirm}
            onRightButtonClick={() => setShowHomeModal(false)}
          />
        </ModalWrapper>
      )}
    </>
  );
};
