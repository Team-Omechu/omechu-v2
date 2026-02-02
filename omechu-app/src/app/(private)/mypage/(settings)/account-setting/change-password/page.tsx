"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { changePassword, ApiClientError } from "@/entities/user";
import {
  BaseModal,
  Button,
  FormField,
  Header,
  Input,
  ModalWrapper,
  Toast,
} from "@/shared";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const hasPasswordError = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/;
    return !regex.test(password);
  };

  const isFormValid =
    currentPassword.length > 0 &&
    !hasPasswordError(newPassword) &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  const handleSubmit = async () => {
    if (isPending || !isFormValid) return;

    if (hasPasswordError(newPassword)) {
      triggerToast("비밀번호 형식을 확인해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword === currentPassword) {
      triggerToast("새 비밀번호는 기존 비밀번호와 달라야 합니다.");
      return;
    }

    setIsPending(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setShowModal(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        triggerToast(err.message || "비밀번호 변경에 실패했습니다.");
      } else {
        triggerToast("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const confirmHelperText =
    confirmPassword.length === 0
      ? undefined
      : newPassword === confirmPassword
        ? "* 비밀번호가 일치합니다"
        : "* 비밀번호가 일치하지 않습니다";

  const confirmHelperState =
    confirmPassword.length === 0
      ? "default"
      : newPassword === confirmPassword
        ? "success"
        : "error";

  return (
    <>
      <Header
        title="비밀번호 변경"
        onBackClick={() => router.push("/mypage/account-setting")}
        showHomeButton={false}
      />

      <main className="relative mt-12 flex h-[80dvh] w-full flex-col items-center justify-between gap-8 px-6">
        <section className="flex w-full flex-col gap-5">
          <FormField label="기존 비밀번호" id="current-password">
            <Input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </FormField>

          <FormField
            label="새 비밀번호"
            id="new-password"
            helperText="* 대소문자, 숫자 및 특수문자 포함 8자 이상"
          >
            <Input
              type="password"
              placeholder="새 비밀번호를 입력해주세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormField>

          <FormField
            label="새 비밀번호 재확인"
            id="confirm-password"
            helperText={confirmHelperText}
            helperState={confirmHelperState}
          >
            <Input
              type="password"
              placeholder="새 비밀번호를 다시 입력해주세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormField>
        </section>
        <Button disabled={!isFormValid || isPending} onClick={handleSubmit}>
          {isPending ? "변경 중..." : "비밀번호 변경하기"}
        </Button>
      </main>

      {showModal && (
        <ModalWrapper>
          <BaseModal
            title="비밀번호가 변경되었어요."
            rightButtonText="확인"
            isCloseButtonShow={false}
            onRightButtonClick={() => router.push("/mypage/account-setting")}
          />
        </ModalWrapper>
      )}

      <Toast
        message={toastMessage}
        state="error"
        show={showToast}
        className="bottom-44"
      />
    </>
  );
}
