"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { logout, useAuthStore } from "@/entities/user";
import { BaseModal, Button, Header, ModalWrapper } from "@/shared";
import { ArrowIcon } from "@/shared/assets/icons";

export default function AccountSettingPage() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = useAuthStore((s) => s.user);
  const email = user?.email || "-";

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <Header
        title="계정 관리"
        onBackClick={() => router.push("/mypage")}
        showHomeButton={false}
      />

      <main className="relative mt-12 flex h-[80dvh] w-full flex-col items-center justify-start gap-8 px-8">
        <section className="flex h-fit w-full justify-between">
          <div className="text-body-3-medium text-font-high flex h-16 flex-1 flex-col justify-between">
            <span>가입 정보</span>
            <span>비밀번호 변경</span>
          </div>
          <div className="flex h-16 flex-2 flex-col items-end justify-between">
            <span className="text-body-4-regular text-font-low">{email}</span>
            <button
              onClick={() =>
                router.push("/mypage/account-setting/change-password")
              }
              className="flex h-8.5 items-center"
            >
              <ArrowIcon currentColor="#707070" />
            </button>
          </div>
        </section>

        <Button onClick={() => setShowLogoutModal(true)}>로그아웃</Button>

        <button
          onClick={() => router.push("/mypage/account-setting/delete-account")}
          className="-mt-3 flex items-center gap-2"
        >
          <span className="text-body-4-regular text-font-placeholder">
            회원탈퇴
          </span>
          <ArrowIcon currentColor="#A8A8A8" width={8.5} />
        </button>
      </main>
      {showLogoutModal && (
        <ModalWrapper>
          <BaseModal
            title="로그아웃 하시겠어요?"
            leftButtonText="네"
            rightButtonText="아니요"
            onCloseClick={() => setShowLogoutModal(false)}
            onLeftButtonClick={handleLogoutConfirm}
            onRightButtonClick={() => setShowLogoutModal(false)}
          />
        </ModalWrapper>
      )}
    </>
  );
}
