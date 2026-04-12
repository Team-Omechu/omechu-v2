//! 26.01.06 작업 완료

import Image from "next/image";

import { BaseModal } from "./BaseModal";

interface menuModalProps {
  menuTitle: string;
  src?: string;
  onCloseClick: () => void;
  onLeftButtonClick: () => void;
  onRightButtonClick: () => void;
}

export function MenuModal({
  menuTitle,
  src,
  onCloseClick,
  onLeftButtonClick,
  onRightButtonClick,
}: menuModalProps) {
  return (
    <BaseModal
      onCloseClick={onCloseClick}
      leftButtonText="다시추천"
      rightButtonText="선택하기"
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    >
      <Image
        src={src && src.trim().length > 0 ? src : "/image/image_empty.svg"}
        alt="음식 이미지"
        width={130}
        height={130}
        className="object-cover"
      />
      <div className="text-body-2-bold text-font-high">{menuTitle}</div>
    </BaseModal>
  );
}
