"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { EmailLoginForm } from "@/widgets/auth";

import {
  type ApiClientError,
  type LoginFormValues,
  getAuthErrorMessage,
  useAuthStore,
  useLoginMutation,
} from "@/entities/user";

import { Toast, useToast } from "@/shared";

/**
 * 이메일 로그인 페이지
 * - 로그인 후 닉네임 유무에 따라 /mainpage 또는 /onboarding으로 이동
 * - 폼 자체는 widgets/auth/EmailLoginForm이 담당
 */
export default function LoginPage() {
  const navigatedRef = useRef(false);
  const justLoggedInRef = useRef(false);

  const router = useRouter();
  const { show: showToast, message: toastMessage, triggerToast } = useToast();
  const { mutate: login, isPending, isSuccess } = useLoginMutation();

  const handleFormSubmit = useCallback(
    (data: LoginFormValues) => {
      login(data, {
        onSuccess: () => {
          // useLoginMutation 내부에서 프로필 fetch + setUser 완료됨
          justLoggedInRef.current = true;
        },
        onError: (error: unknown) => {
          const e = error as ApiClientError;

          const MISSING_INPUT_ERROR_CODE = "C001";
          const USER_NOT_FOUND_ERROR_CODE = "E002";

          const trimmedEmail = data.email.trim();
          const trimmedPassword = data.password.trim();

          const resolvedCode =
            e?.code === MISSING_INPUT_ERROR_CODE &&
            trimmedEmail &&
            trimmedPassword
              ? USER_NOT_FOUND_ERROR_CODE
              : e?.code;

          triggerToast(
            getAuthErrorMessage(resolvedCode, "로그인에 실패했습니다."),
          );
        },
      });
    },
    [login, triggerToast],
  );

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (navigatedRef.current) return;
    if (!justLoggedInRef.current) return;
    if (!isSuccess || !user?.id) return;

    navigatedRef.current = true;
    router.push(user.nickname?.trim() ? "/mainpage" : "/onboarding");
  }, [isSuccess, user, router]);

  return (
    <div className="flex w-full flex-col items-center">
      <EmailLoginForm
        isPending={isPending}
        onFormSubmitAction={handleFormSubmit}
      />

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
