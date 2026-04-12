//! 26.01.12 작업 완료

"use client";

import { CloseIcon } from "@/shared/assets/icons/index";
import { BaseModal } from "@/shared/index";

interface MypageModalProps {
  title: string;
  placeholder?: string;
  inputValue?: string;
  onChangeInput: (value: string) => void;
  onLeftButtonClick: () => void;
  onRightButtonClick: () => void;
}

export function MypageModal({
  title,
  inputValue,
  placeholder = "닉네임",
  onChangeInput,
  onLeftButtonClick,
  onRightButtonClick,
}: MypageModalProps) {
  return (
    <BaseModal
      isCloseButtonShow={false}
      leftButtonText="취소"
      rightButtonText="변경하기"
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    >
      <div className="relative z-50 flex w-full flex-col items-center justify-center gap-4 px-1">
        <div className="text-body-2-bold text-font-high">{title}</div>
        <input
          value={inputValue}
          onChange={(e) => onChangeInput(e.target.value)}
          placeholder={placeholder}
          className="border-font-disabled h-12 w-full rounded-[10px] border pr-9 pl-4"
        />
        <button
          type="button"
          onClick={() => onChangeInput("")}
          className="absolute right-4 bottom-3.5"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </BaseModal>
  );
}
