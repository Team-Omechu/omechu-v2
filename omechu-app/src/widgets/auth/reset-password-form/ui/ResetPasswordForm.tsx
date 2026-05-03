"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  type ApiClientError,
  type ResetPasswordFormValues,
  getAuthErrorMessage,
  resetPasswordSchema,
} from "@/entities/user";

import { Button, FormField, Input, Toast, useToast } from "@/shared";

type ResetPasswordFormProps = {
  onFormSubmitAction: (data: ResetPasswordFormValues) => Promise<void>;
};

export default function ResetPasswordForm({
  onFormSubmitAction,
}: ResetPasswordFormProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [passwordConfirmBlurred, setPasswordConfirmBlurred] = useState(false);
  const { show: showToast, message: toastMessage, triggerToast } = useToast();

  const onSubmitHandler = useCallback(
    async (values: ResetPasswordFormValues) => {
      try {
        await onFormSubmitAction(values);
      } catch (err: unknown) {
        const e = err as ApiClientError;
        const msg = getAuthErrorMessage(
          e?.code,
          "비밀번호 재설정에 실패했습니다.",
        );
        triggerToast(msg);
      }
    },
    [onFormSubmitAction, triggerToast],
  );

  const onSubmit = handleSubmit(onSubmitHandler);

  return (
    <>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormField
              label="새 비밀번호"
              id="reset-password"
              helperText={
                (passwordBlurred && errors.password?.message) ||
                "* 대소문자, 숫자 및 특수문자 포함 8자 이상"
              }
              helperState={
                passwordBlurred && errors.password ? "error" : undefined
              }
            >
              <Input
                type="password"
                placeholder="새 비밀번호를 입력해주세요"
                value={field.value}
                onChange={field.onChange}
                onBlur={() => {
                  setPasswordBlurred(true);
                  field.onBlur();
                }}
                width="default"
                className="w-full"
              />
            </FormField>
          )}
        />

        <Controller
          name="passwordConfirm"
          control={control}
          render={({ field }) => (
            <FormField
              label="새 비밀번호 재확인"
              id="reset-password-confirm"
              helperText={
                passwordConfirmBlurred && errors.passwordConfirm
                  ? errors.passwordConfirm?.message ||
                    "* 새 비밀번호가 일치하지 않습니다!"
                  : undefined
              }
              helperState={
                passwordConfirmBlurred && errors.passwordConfirm
                  ? "error"
                  : undefined
              }
            >
              <Input
                type="password"
                placeholder="새 비밀번호를 입력해주세요"
                value={field.value}
                onChange={field.onChange}
                onBlur={() => {
                  setPasswordConfirmBlurred(true);
                  field.onBlur();
                }}
                width="default"
                className="w-full"
              />
            </FormField>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "설정 중..." : "비밀번호 설정하기"}
          </Button>
        </div>
      </form>

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </>
  );
}
