"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ResetPasswordForm } from "@/widgets/auth";

import {
  type ResetPasswordFormValues,
  useResetPasswordMutation,
} from "@/entities/user";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

import { BaseModal, ContentLoading, Header, ModalWrapper } from "@/shared";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh flex-col">
          <ContentLoading />
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

function ResetPasswordClient() {
  const [isReady, setIsReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFormSubmit = async (data: ResetPasswordFormValues) => {
    await resetPassword({ ...data, token: "" });
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    router.push("/login");
  };

  if (!isReady) {
    return (
      <main className="flex min-h-dvh flex-col">
        <ContentLoading />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <Header />

      <div className="flex flex-col px-5">
        <div className="flex flex-col items-center gap-3 py-5">
          <h1 className="text-body-2-bold text-font-high text-center">
            비밀번호 재설정
          </h1>
          <p className="text-body-4-regular text-font-low text-center">
            사용하실 새로운 비밀번호를 설정해 주세요
          </p>
        </div>

        <div className="pt-8">
          <ResetPasswordForm onFormSubmitAction={handleFormSubmit} />
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
