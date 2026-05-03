"use client";

import { useRouter } from "next/navigation";

import { ForgotPasswordForm } from "@/widgets/auth";

import {
  type ApiClientError,
  type FindPasswordFormValues,
  useRequestPasswordResetMutation,
} from "@/entities/user";

import { Header, Toast, useToast } from "@/shared";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutateAsync: requestReset } = useRequestPasswordResetMutation();
  const { show: showToast, message: toastMessage, triggerToast } = useToast();

  const handleFormSubmit = async (data: FindPasswordFormValues) => {
    try {
      await requestReset(data);
      router.push("/forgot-password/sent");
    } catch (error: unknown) {
      const e = error as ApiClientError & { code?: string; status?: number };
      const msg: string =
        e?.message || "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
      triggerToast(msg);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <div className="flex flex-col px-5">
        {/* 타이틀 영역 */}
        <div className="flex flex-col items-center p-12">
          <h1 className="text-body-2-bold text-font-high text-center">
            비밀번호 찾기
          </h1>
        </div>

        {/* 설명 영역 */}
        <div className="flex items-center justify-center px-5 py-2.5">
          <p className="text-body-4-regular text-font-low text-center">
            가입하신 이메일 주소를 입력하여
            <br />
            비밀번호를 재설정하실 수 있어요
          </p>
        </div>

        {/* 폼 영역 */}
        <div className="pt-12">
          <ForgotPasswordForm onFormSubmitAction={handleFormSubmit} />
        </div>
      </div>

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
