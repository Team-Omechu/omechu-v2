"use client";

import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn.util";

import { BaseModal } from "./BaseModal";

const battleModalStyles = cva("flex flex-col items-center", {
  variants: {
    modalType: {
      createDone: "p-6 gap-4",
      enterRoom: "p-8 gap-6",
    },
  },
  defaultVariants: {
    modalType: "enterRoom",
  },
});

type BattleModalProps = VariantProps<typeof battleModalStyles> & {
  modalType: "createDone" | "enterRoom";
  battleRoomName: string;
  roomCode?: string;
  shareUrl?: string;
  onClose?: () => void;
  onShare?: () => void;
  onEnter: () => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function BattleModal({
  modalType,
  battleRoomName,
  roomCode,
  onClose,
  onShare,
  onEnter,
  value,
  onChange,
}: BattleModalProps) {
  return (
    <div className={cn(battleModalStyles({ modalType }))}>
      {modalType === "createDone" ? (
        <BaseModal
          title={`[${battleRoomName}] 생성 완료!`}
          desc="아래 링크를 친구들과 공유하세요."
          leftButtonText="공유하기"
          rightButtonText="바로 참여하기"
          onCloseClick={onClose}
          onLeftButtonClick={onShare}
          onRightButtonClick={onEnter}
        >
          <div className="mt-2 flex w-full flex-col items-center gap-1">
            <span className="text-body-4-medium text-font-placeholder">
              방 번호
            </span>
            <div className="border-font-disabled flex h-10 w-72 items-center justify-center rounded-md border">
              <span className="text-body-3-medium text-font-high">
                {roomCode}
              </span>
            </div>
          </div>
        </BaseModal>
      ) : (
        <BaseModal
          title={`[${battleRoomName}]`}
          rightButtonText="입장하기"
          onCloseClick={onClose}
          onRightButtonClick={onEnter}
        >
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="닉네임을 입력하세요"
            className="border-font-disabled placeholder:text-caption-1-regular placeholder:text-foundation-grey-normal mt-3 flex h-10 w-72 items-center justify-center rounded-md border px-4"
          />
        </BaseModal>
      )}
    </div>
  );
}
