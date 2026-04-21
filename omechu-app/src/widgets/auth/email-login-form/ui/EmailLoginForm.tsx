"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { type LoginFormValues, loginSchema } from "@/entities/user";

import { Button, FormField, Input } from "@/shared";

type EmailLoginFormProps = {
  isPending: boolean;
  onFormSubmit: (data: LoginFormValues) => void;
};

export default function EmailLoginForm({
  isPending,
  onFormSubmit,
}: EmailLoginFormProps) {
  const [rememberMe, setRememberMe] = useState(true);

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
    (data: LoginFormValues) => onFormSubmit(data),
    [onFormSubmit],
  );

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="mt-14 flex w-full flex-col gap-5 px-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5">
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

          <div className="flex cursor-pointer items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRememberMe((v) => !v)}
              className="border-font-high bg-background-secondary flex size-5 items-center justify-center rounded-sm border-[0.5px]"
              aria-pressed={rememberMe}
              aria-label="로그인 상태 유지"
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

        <Button
          type="submit"
          disabled={isFormEmpty || isEmailFormatInvalid || isPending}
          className="h-12 w-full"
        >
          {isPending ? "로그인 중..." : "로그인"}
        </Button>
      </div>

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
  );
}
