"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  type ApiClientError,
  type LoginFormValues,
  getAuthErrorMessage,
  loginSchema,
  useAuthStore,
  useLoginMutation,
} from "@/entities/user";

import { Button, FormField, Input, Toast, useToast } from "@/shared";

/**
 * 이메일 로그인 페이지
 * - 이메일/비밀번호 입력 폼
 * - 로그인 상태 유지 체크박스
 * - 비밀번호 찾기 / 회원가입 링크
 */
export default function EmailLoginPage() {
  const [rememberMe, setRememberMe] = useState(true);
  const navigatedRef = useRef(false);
  const justLoggedInRef = useRef(false);

  const router = useRouter();
  const { show: showToast, message: toastMessage, triggerToast } = useToast();

  const { mutate: login, isPending, isSuccess } = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = useWatch({ control, name: "email" });
  const passwordValue = useWatch({ control, name: "password" });
  const trimmedEmailValue = emailValue?.trim();
  const trimmedPasswordValue = passwordValue?.trim();

  const isEmailFormatInvalid =
    Boolean(trimmedEmailValue) &&
    !loginSchema.shape.email.safeParse(trimmedEmailValue).success;

  const isFormEmpty = !trimmedEmailValue || !trimmedPasswordValue;

  const onSubmit = useCallback(
    (data: LoginFormValues) => {
      login(data, {
        onSuccess: () => {
          // useLoginMutation 내부에서 이미 프로필 fetch + setUser 완료
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

          const msg = getAuthErrorMessage(
            resolvedCode,
            "로그인에 실패했습니다.",
          );
          triggerToast(msg);
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
    if (user.nickname && user.nickname.trim().length > 0) {
      router.push("/mainpage");
    } else {
      router.push("/onboarding");
    }
  }, [isSuccess, user, router]);

  // eslint-disable-next-line react-hooks/refs -- handleSubmit is from react-hook-form
  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <div className="flex w-full flex-col items-center">
      {/* 로그인 폼 */}
      <form
        onSubmit={handleFormSubmit}
        className="mt-14 flex w-full flex-col gap-5 px-5"
      >
        {/* 입력 필드 + 체크박스 + 버튼 영역 */}
        <div className="flex flex-col gap-3">
          {/* 입력 필드들 */}
          <div className="flex flex-col gap-2.5">
            {/* 이메일 */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormField
                  label="이메일"
                  id="email"
                  helperText={errors.email?.message}
                  helperState={errors.email ? "error" : undefined}
                >
                  <Input
                    type="email"
                    placeholder="이메일을 입력해주세요"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="w-full"
                  />
                </FormField>
              )}
            />

            {/* 비밀번호 */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormField label="비밀번호" id="password">
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="w-full"
                  />
                </FormField>
              )}
            />

            {/* 로그인 상태 유지 체크박스 */}
            <div className="flex cursor-pointer items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="border-font-high bg-background-secondary flex size-5 items-center justify-center rounded-sm border-[0.5px]"
              >
                {rememberMe && (
                  <svg
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1"
                      stroke="#242424"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className="text-caption-1-regular text-font-high">
                로그인 상태 유지
              </span>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            disabled={isFormEmpty || isEmailFormatInvalid || isPending}
            className="h-12 w-full"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </div>

        {/* 비밀번호 찾기 / 회원가입 링크 */}
        <div className="text-caption-1-regular flex items-center justify-center gap-1">
          <Link href="/forgot-password" className="text-font-medium">
            비밀번호 찾기
          </Link>
          <span className="text-font-placeholder">|</span>
          <Link href="/signup" className="text-font-medium">
            회원가입
          </Link>
        </div>
      </form>

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
