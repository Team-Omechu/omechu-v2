"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerSupportSection, UserInfoSection } from "@/widgets/mypage";

import { useProfile, useUpdateProfileMutation } from "@/entities/user";

import { CloseIcon } from "@/shared/assets/icons/index";

import { BaseModal, Header, MainLoading, ModalWrapper } from "@/shared";

export default function MypageMain() {
  const router = useRouter();
  const { profile, loading, error } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleCloseModal = () => {
    setInputValue("");
    setIsModalOpen(false);
  };

  const handleSubmitNickname = () => {
    if (!inputValue.trim() || updateProfileMutation.isPending) return;

    updateProfileMutation.mutate(
      { nickname: inputValue.trim() },
      {
        onSuccess: () => handleCloseModal(),
        onError: () => alert("닉네임 변경에 실패했습니다."),
      },
    );
  };

  if (loading) {
    return (
      <>
        <Header title="마이페이지" onBackClick={() => router.push("/")} />
        <MainLoading />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header title="마이페이지" onBackClick={() => router.push("/")} />
        <main className="flex h-[80dvh] items-center justify-center">
          <p className="text-font-low">
            {error?.message || "프로필을 불러올 수 없습니다."}
          </p>
        </main>
      </>
    );
  }

  const userInfo = {
    name: profile.nickname || "사용자",
    exerciseStatus: profile.exercise || "미설정",
    favoriteFood: profile.prefer?.join(", ") || "미설정",
    allergy: profile.allergy?.join(", ") || "없음",
  };

  return (
    <>
      <Header title="마이페이지" onBackClick={() => router.push("/")} />

      <main className="relative mt-10 flex h-[80dvh] flex-col items-center gap-6 px-5">
        <UserInfoSection
          {...userInfo}
          onNicknameClick={() => {
            setInputValue(userInfo.name);
            setIsModalOpen(true);
          }}
        />
        {/* 임시 주석 처리! */}
        {/* <SetAlarmSection /> */}
        <CustomerSupportSection />
      </main>

      {isModalOpen && (
        <ModalWrapper className="pb-52" onClose={handleCloseModal}>
          <BaseModal
            isCloseButtonShow={false}
            leftButtonText="취소"
            rightButtonText="변경하기"
            onLeftButtonClick={handleCloseModal}
            onRightButtonClick={handleSubmitNickname}
          >
            <div className="relative z-50 flex w-full flex-col items-center justify-center gap-4 px-1">
              <div className="text-body-2-bold text-font-high">닉네임 변경</div>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={userInfo.name}
                className="border-font-disabled h-12 w-full rounded-[10px] border pr-9 pl-4"
              />
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-4 bottom-3.5"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </BaseModal>
        </ModalWrapper>
      )}
    </>
  );
}
