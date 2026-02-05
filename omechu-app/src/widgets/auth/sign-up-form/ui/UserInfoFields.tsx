"use client";

import { useState } from "react";

import { Controller, useFormContext } from "react-hook-form";

import {
  ApiClientError,
  useSendVerificationCodeMutation,
  useVerifyVerificationCodeMutation,
  type SignupFormValues,
} from "@/entities/user";
import { Button, FormField, Input, Toast } from "@/shared";

export default function UserInfoFields() {
  const {
    control,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [passwordConfirmBlurred, setPasswordConfirmBlurred] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const verificationCode = watch("verificationCode");
  const email = watch("email");

  const { mutate: sendCode, isPending: isSending } =
    useSendVerificationCodeMutation();
  const { mutate: verifyCode, isPending: isVerifying } =
    useVerifyVerificationCodeMutation();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSendCode = () => {
    const emailToSend = getValues("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      triggerToast("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    sendCode(emailToSend, {
      onSuccess: (data) => {
        setIsCodeSent(true);
        triggerToast(data.message);
      },
      onError: (error: unknown) => {
        const e = error as ApiClientError & { code?: string };
        const msg: string =
          e?.message ||
          "인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        triggerToast(msg);
      },
    });
  };

  const handleVerifyCode = () => {
    if (!verificationCode) return;
    verifyCode(
      { email, code: verificationCode },
      {
        onSuccess: (data) => {
          setIsVerified(true);
          triggerToast(data.message);
        },
        onError: (error: unknown) => {
          const e = error as ApiClientError & {
            reason?: string;
            code?: string;
          };
          let msg: string = e?.reason || e?.message || "인증에 실패했습니다.";
          switch (e?.code) {
            case "V001":
              msg = e.reason || "인증번호가 올바르지 않습니다.";
              break;
            case "V002":
              msg = e.reason || "인증번호가 만료되었어요. 다시 전송해 주세요.";
              break;
          }
          triggerToast(msg);
        },
      },
    );
  };

  return (
    <div className="relative flex flex-col gap-2">
      {/* 이메일 + 인증번호 전송 버튼 */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormField
            label="이메일"
            id="signup-email"
            helperText={errors.email?.message}
            helperState={errors.email ? "error" : undefined}
            rightSlot={
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={!field.value || isSending || isVerified}
                width="sm"
              >
                {isSending
                  ? "전송 중..."
                  : isCodeSent
                    ? "재전송"
                    : "인증번호 전송"}
              </Button>
            }
          >
            <Input
              type="email"
              placeholder="이메일을 입력해주세요"
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className="flex-1!"
            />
          </FormField>
        )}
      />

      {/* 인증번호 입력 + 확인 버튼 (인증번호 전송 후 표시) */}
      {isCodeSent && (
        <Controller
          name="verificationCode"
          control={control}
          render={({ field }) => (
            <FormField
              label=""
              id="signup-verification-code"
              helperText={errors.verificationCode?.message}
              helperState={errors.verificationCode ? "error" : undefined}
              rightSlot={
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={
                    !verificationCode ||
                    verificationCode.length !== 6 ||
                    isVerifying ||
                    isVerified
                  }
                  width="sm"
                >
                  {isVerifying
                    ? "확인 중..."
                    : isVerified
                      ? "인증 완료"
                      : "인증번호 확인"}
                </Button>
              }
            >
              <Input
                type="text"
                placeholder="인증번호 6자리를 입력해주세요"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="flex-1!"
              />
            </FormField>
          )}
        />
      )}

      {/* 비밀번호 */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormField
            label="비밀번호"
            id="signup-password"
            helperText={
              (passwordBlurred && errors.password?.message) ||
              "* 영문 대소문자, 숫자 및 특수문자 포함 8자 이상"
            }
            helperState={
              passwordBlurred && errors.password ? "error" : undefined
            }
          >
            <Input
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={() => {
                setPasswordBlurred(true);
                field.onBlur();
              }}
              className="w-full!"
            />
          </FormField>
        )}
      />

      {/* 비밀번호 재확인 */}
      <Controller
        name="passwordConfirm"
        control={control}
        render={({ field }) => (
          <FormField
            label="비밀번호 재확인"
            id="signup-password-confirm"
            helperText={
              passwordConfirmBlurred && errors.passwordConfirm
                ? errors.passwordConfirm?.message
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
              placeholder="비밀번호를 다시 입력해 주세요"
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={() => {
                setPasswordConfirmBlurred(true);
                field.onBlur();
              }}
              className="w-full!"
            />
          </FormField>
        )}
      />

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
