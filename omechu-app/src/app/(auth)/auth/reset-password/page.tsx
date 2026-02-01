"use client";

import { Suspense, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ApiClientError,
  useResetPasswordMutation,
  type ResetPasswordFormValues,
} from "@/entities/user";
import { BaseModal, Header, ModalWrapper } from "@/shared";
import { ResetPasswordForm } from "@/widgets/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center">
          <span className="text-font-medium">로딩 중...</span>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

function ResetPasswordClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  const handleFormSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      throw new ApiClientError(
        "유효하지 않은 링크입니다. 이메일의 링크를 다시 확인해 주세요.",
        "E001",
      );
    }
    await resetPassword({ ...data, token });
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    router.push("/login");
  };

  return (
    <main className="flex flex-1 flex-col">
      <Header />

      <div className="flex flex-col px-5">
        {/* 타이틀 영역 */}
        <div className="flex flex-col items-center gap-3 py-5">
          <h1 className="text-body-2-bold text-font-high text-center">
            비밀번호 재설정
          </h1>
          <p className="text-body-4-regular text-font-low text-center">
            사용하실 새로운 비밀번호를 설정해 주세요
          </p>
        </div>

        {/* 폼 영역 */}
        <div className="pt-8">
          <ResetPasswordForm onFormSubmit={handleFormSubmit} />
        </div>
      </div>

      {isModalOpen && (
        <ModalWrapper>
          <BaseModal
            title="비밀번호를 재설정했어요"
            desc="새로운 비밀번호로 로그인하세요"
            rightButtonText="확인"
            isCloseButtonShow={false}
            onRightButtonClick={handleModalConfirm}
          />
        </ModalWrapper>
      )}
    </main>
  );
}
