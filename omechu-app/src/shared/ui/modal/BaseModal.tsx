//! 26.01.06 작업 완료
import Image from "next/image";

import { Button } from "@/shared/ui/button/Button";

interface BaseModalProps {
  children?: React.ReactNode;

  title?: string;
  desc?: string;
  leftButtonText?: string;
  rightButtonText?: string;

  isCloseButtonShow?: boolean;
  isLogoShow?: boolean;

  onCloseClick?: () => void;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
}

export function BaseModal({
  children,

  title,
  desc,

  leftButtonText,
  rightButtonText,

  isCloseButtonShow = true,
  isLogoShow = false,

  onCloseClick,
  onLeftButtonClick,
  onRightButtonClick,
}: BaseModalProps) {
  return (
    <section className="bg-brand-secondary relative h-fit w-83.75 rounded-[20px] px-5 pt-6 pb-2 shadow-xl">
      {isCloseButtonShow && (
        <button onClick={onCloseClick} className="absolute top-3 right-3">
          <Image
            src={"/x/black_x_icon.svg"}
            alt="모달 닫기 버튼"
            width={24}
            height={24}
          />
        </button>
      )}
      {isCloseButtonShow && <div className="h-3" />}
      <div className="my-2 mt-1 flex w-full flex-col items-center">
        {isLogoShow && (
          <Image
            src={"/logo/logo.svg"}
            alt="오메추 로고 이미지"
            width={107}
            height={70}
            style={{ width: "auto", height: "auto" }}
            className="mb-2"
          />
        )}
        {title && (
          <div className="text-body-2-medium text-foundation-grey-darker text-center whitespace-pre-line">
            {title}
          </div>
        )}
        {desc && (
          <div className="text-caption-1-regular text-font-placeholder w-full text-center whitespace-pre-line">
            {desc}
          </div>
        )}
        {children}
        <div className="mt-5 flex w-full gap-2">
          {leftButtonText && (
            <Button
              bgColor="grey"
              fontColor="black"
              onClick={onLeftButtonClick}
            >
              {leftButtonText}
            </Button>
          )}
          <Button className="text-brand-secondary" onClick={onRightButtonClick}>
            {rightButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
