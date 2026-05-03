"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { TagCard } from "@/widgets/tag-card";

import { useLocationAnswerStore } from "@/entities/location";
import { type MenuItem, useGetMenu } from "@/entities/menu";
import { useQuestionAnswerStore } from "@/entities/question";
import { useAuthStore } from "@/entities/user";

import {
  BaseModal,
  Button,
  ContentLoading,
  Header,
  ModalWrapper,
  RecommendedFoodCard,
  Toast,
  useToast,
} from "@/shared";

export default function ResultPage() {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useGetMenu();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { addException } = useQuestionAnswerStore();
  const { setKeyword } = useLocationAnswerStore();

  const menus: MenuItem[] = useMemo(
    () => (Array.isArray(data?.results) ? data.results : []),
    [data],
  );

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { show: showToast, message: toastMessage, triggerToast } = useToast();

  const [reshuffleAttemptCount, setReshuffleAttemptCount] = useState(0);
  const [showLoginModalForReshuffle, setShowLoginModalForReshuffle] =
    useState(false);

  const [showStopRecommendModal, setShowStopRecommendModal] = useState(false);

  const handleStopAndGoHome = () => {
    setShowStopRecommendModal(false);
    router.push("/mainpage");
  };

  const handleContinueRecommend = () => {
    setShowStopRecommendModal(false);
  };

  const handleNext = () => {
    if (openMenu !== null && openMenu !== undefined) {
      setKeyword(openMenu);
      router.push(`/mainpage/result/${encodeURIComponent(openMenu)}?record=1`);
    } else {
      triggerToast("메뉴를 선택해주세요.");
    }
  };

  const handleReshuffle = () => {
    if (!isLoggedIn) {
      setReshuffleAttemptCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setShowLoginModalForReshuffle(true);
          return next;
        }
        return next;
      });

      if (reshuffleAttemptCount + 1 < 3) {
        const exceptionMenus = menus.slice(0, 3).map((m) => m.menu);
        const unique = Array.from(new Set(exceptionMenus));
        unique.forEach(addException);
        refetch();
        setOpenMenu(null);
      }
      return;
    }

    const exceptionMenus = menus.slice(0, 3).map((m) => m.menu);
    const unique = Array.from(new Set(exceptionMenus));
    unique.forEach(addException);
    refetch();
    setOpenMenu(null);
  };

  const handleLoginButton = () => {
    router.push("/login");
    setShowLoginModalForReshuffle(false);
  };

  if (isLoading || isRefetching) {
    return (
      <div className="flex min-h-dvh flex-col items-center">
        <Header
          title="맞춤 추천"
          onBackClick={() => router.back()}
          showHomeButton={true}
        />
        <ContentLoading />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center">
      <Header
        title="맞춤 추천"
        onBackClick={() => router.back()}
        showHomeButton={true}
      />

      <div className="mt-3 ml-2.5 flex flex-col gap-4 px-4">
        {menus.map((menu) => (
          <RecommendedFoodCard
            key={menu.menu}
            menuTitle={menu.menu}
            menuDesc={menu.text}
            src={menu.image_link || ""}
            onCardClick={() =>
              setOpenMenu(openMenu === menu.menu ? null : menu.menu)
            }
            selected={openMenu === menu.menu}
          />
        ))}
      </div>

      <div className="mt-2 flex w-82.5 gap-2 py-2">
        <Button
          className="hover:bg-grey-normal text-foundation-grey-darker border-font-disabled bg-brand-tertiary flex-1 rounded-md border px-4 py-2"
          onClick={handleReshuffle}
        >
          다시 추천
        </Button>

        <Button
          className="bg-primary-normal hover:bg-primary-normal-hover text-brand-secondary flex-1 rounded-md px-4 py-2"
          onClick={handleNext}
        >
          선택하기
        </Button>
      </div>

      <div className="px-4 py-2">
        <div className="rounded-xl border bg-white p-3 text-sm">
          <TagCard />
        </div>
      </div>

      {showLoginModalForReshuffle && (
        <ModalWrapper>
          <BaseModal
            title="딱 맞는 추천을 원하시나요?"
            desc="로그인 후 더 다양한 서비스를 누려보세요"
            rightButtonText="로그인하기"
            isLogoShow
            isCloseButtonShow={false}
            onRightButtonClick={handleLoginButton}
          />
        </ModalWrapper>
      )}

      {showStopRecommendModal && (
        <ModalWrapper>
          <BaseModal
            title="메뉴 추천을 중단하시겠어요?"
            leftButtonText="홈으로"
            rightButtonText="계속하기"
            isCloseButtonShow={false}
            onLeftButtonClick={handleStopAndGoHome}
            onRightButtonClick={handleContinueRecommend}
          />
        </ModalWrapper>
      )}
      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
