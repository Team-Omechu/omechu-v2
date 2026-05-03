"use client";

import Link from "next/link";
import { useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  type FindPasswordFormValues,
  findPasswordSchema,
} from "@/entities/user";

import { Button, FormField, Input } from "@/shared";

type ForgotPasswordFormProps = {
  onFormSubmitAction: (data: FindPasswordFormValues) => Promise<void>;
};

export default function ForgotPasswordForm({
  onFormSubmitAction,
}: ForgotPasswordFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FindPasswordFormValues>({
    resolver: zodResolver(findPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = useCallback(
    async (data: FindPasswordFormValues) => {
      await onFormSubmitAction(data);
    },
    [onFormSubmitAction],
  );

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <>
      <form onSubmit={handleFormSubmit} className="flex w-full flex-col">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormField
              label="이메일"
              id="forgot-email"
              helperText={errors.email?.message}
              helperState={errors.email ? "error" : undefined}
            >
              <Input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                width="default"
                className="w-full"
              />
            </FormField>
          )}
        />

        <div className="pt-5">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "메일 발송 중..." : "메일 발송하기"}
          </Button>
        </div>
      </form>

      {/* 하단 링크 영역 */}
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="text-caption-1-regular flex items-center gap-5">
          <span className="text-font-placeholder">비밀번호가 생각 났어요</span>
          <Link
            href="/login"
            className="text-caption-1-medium text-font-high hover:underline"
          >
            로그인 하기
          </Link>
        </div>
        <div className="text-caption-1-regular flex items-center gap-5">
          <span className="text-font-placeholder">계정이 아직 없어요</span>
          <Link
            href="/signup"
            className="text-caption-1-medium text-font-high hover:underline"
          >
            회원가입하기
          </Link>
        </div>
      </div>
    </>
  );
}
