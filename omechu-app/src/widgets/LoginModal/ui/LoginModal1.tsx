import React from "react";

import Image from "next/image";

import { Button } from "@/shared";

type LoginPromptModalProps = {
  onConfirm: () => void; // "로그인 하기" 버튼 클릭 시
  onClose: () => void; // "X" 버튼 클릭 시
  onSkip?: () => void; // "그냥 추천받기" 버튼 클릭 시
};

export function LoginPromptModal({
  onConfirm,
  onClose,
  onSkip,
}: LoginPromptModalProps) {
  // 이 컴포넌트는 ModalWrapper 내에서 사용되어야 합니다.
  return (
    <div className="border-grey-dark-hover relative flex w-[315px] flex-col items-center rounded-[20px] border bg-white px-6 pt-6 pb-6 text-center shadow-lg">
      <button onClick={onClose} className="absolute top-5 right-5 z-10 p-1">
        <Image src="/x/black_x_icon.svg" alt="close" width={24} height={24} />
      </button>

      <div className="mb-4">
        <Image
          src="/logo/logo.png"
          alt="Omechu Logo"
          width={106}
          height={70}
          className="drop-shadow-lg"
        />
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-grey-darker text-xl">
          더 정교한 추천을 원하시나요?
        </h2>
        <p className="text-grey-normal-active text-sm">
          로그인 후 더 다양한 서비스를 누려보세요
        </p>
      </div>

      <div className="flex w-full items-center justify-center gap-3">
        <Button width="sm">그냥 추천받기</Button>
        <Button onClick={onConfirm} width="sm">
          로그인 하기
        </Button>
      </div>
    </div>
  );
}

export default LoginPromptModal;
