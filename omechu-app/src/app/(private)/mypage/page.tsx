"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useProfile, useUpdateProfileMutation } from "@/entities/user";
import { Header, ModalWrapper, MainLoading } from "@/shared";
import { MypageModal } from "@/shared/ui/modal/MypageModal";
import {
  CustomerSupportSection,
  SetAlarmSection,
  UserInfoSection,
} from "@/widgets/mypage/ui";

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
        <SetAlarmSection />
        <CustomerSupportSection />
      </main>

      {isModalOpen && (
        <ModalWrapper className="pb-52" onClose={handleCloseModal}>
          <MypageModal
            title="닉네임 변경"
            placeholder={userInfo.name}
            inputValue={inputValue}
            onChangeInput={setInputValue}
            onLeftButtonClick={handleCloseModal}
            onRightButtonClick={handleSubmitNickname}
          />
        </ModalWrapper>
      )}
    </>
  );
}
