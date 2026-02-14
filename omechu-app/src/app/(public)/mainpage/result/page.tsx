"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useLocationAnswerStore } from "@/entities/location";
import { MenuItem, useGetMenu } from "@/entities/menu";
import { useQuestionAnswerStore } from "@/entities/question";
import { useAuthStore } from "@/entities/user/model/auth.store";
import {
  Header,
  MainLoading,
  ModalWrapper,
  BaseModal,
  Toast,
  RecommendedFoodCard,
  Button,
} from "@/shared";
import { TagCard } from "@/widgets/TagCard";

export default function ResultPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useGetMenu();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { addException } = useQuestionAnswerStore();
  const { setKeyword } = useLocationAnswerStore();

  const menus: MenuItem[] = useMemo(
    () => (Array.isArray(data?.results) ? data.results : []),
    [data],
  );

  // UI states
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // filtered list (로그인 제외 API 성공 여부와 별개로 UI에서 즉시 제거)
  const [filteredMenus, setFilteredMenus] = useState<MenuItem[]>([]);

  // ----- 모달 상태들 -----
  // 1) 로그인 상태에서 "제외하시겠어요?" 확인 모달
  const [showExcludeConfirmModal, setShowExcludeConfirmModal] = useState(false);
  const [excludeMenu, setExcludeMenu] = useState<string | null>(null);
  const [showHomeModal, setShowHomeModal] = useState(false);

  // 2) 비로그인: 다시추천 3번 눌렀을 때 로그인 유도 모달 (A)
  const [reshuffleAttemptCount, setReshuffleAttemptCount] = useState(0);
  const [showLoginModalForReshuffle, setShowLoginModalForReshuffle] =
    useState(false);

  // 3) 비로그인: 제외하기(마이너스) 눌렀을 때 로그인 유도 모달 (B)
  const [showLoginModalForExclude, setShowLoginModalForExclude] =
    useState(false);

  // 4) 홈으로(추천 중단) 모달
  const [showStopRecommendModal, setShowStopRecommendModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2500);
  };

  // menus -> filteredMenus sync
  useEffect(() => {
    // 서버 data 쓰는 중이면 menus로, 지금은 mock 쓰면 아래 map 렌더에서 menuMock 쓰는 구조니까
    // 향후 data 적용할 거면 아래처럼 menus 기반으로 세팅하면 됨.
    setFilteredMenus(menus);
  }, [menus]);

  // --- 헤더 "홈으로" (추천 중단) ---
  // Header에 showBack/onBack을 연결해서 "홈으로 눌렀을 경우" 시나리오를 만들었어.
  const handleHeaderBack = () => {
    setShowStopRecommendModal(true);
  };

  const handleStopAndGoHome = () => {
    setShowStopRecommendModal(false);
    router.push("/mainpage"); // 홈 경로가 다르면 여기만 바꾸면 됨
  };

  const handleContinueRecommend = () => {
    setShowStopRecommendModal(false);
  };

  // --- 카드 선택 후 다음 ---
  const handleNext = () => {
    if (openMenu != null) {
      setKeyword(openMenu);
      router.push(`/mainpage/result/${encodeURIComponent(openMenu)}?record=1`);
    } else {
      triggerToast("메뉴를 선택해주세요.");
    }
  };

  // --- 다시 추천 ---
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

      // 비로그인이라도 1~2회는 재추천 허용
      if (reshuffleAttemptCount + 1 < 3) {
        const exceptionMenus = menus.slice(0, 3).map((m) => m.menu);
        const unique = Array.from(new Set(exceptionMenus));
        unique.forEach(addException);
        refetch();
        setOpenMenu(null);
      }
      return;
    }

    // 로그인 상태: 제한 없이 재추천
    const exceptionMenus = menus.slice(0, 3).map((m) => m.menu);
    const unique = Array.from(new Set(exceptionMenus));
    unique.forEach(addException);
    refetch();
    setOpenMenu(null);
  };

  // --- 제외하기(마이너스) ---
  const handleExcludeClick = (menuName: string) => {
    if (!isLoggedIn) {
      // 비로그인: 제외하기 누르면 로그인 유도 모달(B)
      setShowLoginModalForExclude(true);
      return;
    }

    // 로그인: "제외하시겠어요?" 모달
    setExcludeMenu(menuName);
    setShowExcludeConfirmModal(true);
  };

  const handleExcludeConfirm = () => {
    if (excludeMenu != null) {
      // UI 즉시 제거 (현재 렌더는 mock 기반이지만, 실제 data 렌더로 바뀌면 filteredMenus 사용하면 됨)
      setFilteredMenus((prev) =>
        prev.filter((menu) => menu.menu !== excludeMenu),
      );
      if (openMenu === excludeMenu) setOpenMenu(null);

      // exceptMenu({ menuName: excludeMenu }).catch(() => {
      // triggerToast("메뉴 제외에 실패했습니다.");
      //  });
    }

    setShowExcludeConfirmModal(false);
    setExcludeMenu(null);
  };

  const handleLoginButton = () => {
    router.push("/login");
    setShowLoginModalForReshuffle(false);
    setShowLoginModalForExclude(false);
  };

  // 로딩 처리 (핸들러 내부에서 return 컴포넌트 하면 안 됨)
  if (isLoading || isRefetching) return <MainLoading />;
  // error 처리 필요하면 여기서 분기
  // if (error) ...

  return (
    <div className="flex h-screen flex-col">
      <Header
        title="맞춤 추천"
        onBackClick={() => router.back()}
        showHomeButton={true}
        onHomeClick={() => setShowHomeModal(true)}
      />

      <div className="mt-3 ml-2.5 flex flex-col gap-4 px-4">
        {menus.map((menu) => (
          <RecommendedFoodCard
            key={menu.menu}
            menuTitle={menu.menu}
            menuDesc={menu.text}
            src={menu.image_link || ""}
            onMinusButtonClick={() => handleExcludeClick(menu.menu)}
            onCardClick={() =>
              setOpenMenu(openMenu === menu.menu ? null : menu.menu)
            }
            selected={openMenu === menu.menu}
          />
        ))}
      </div>

      <div className="mt-2 flex gap-2 px-4 py-2">
        <Button
          className="hover:bg-grey-normal flex-1 rounded-md border border-[#2424243d] bg-[#EEE] px-4 py-2 text-[#393939]"
          onClick={handleReshuffle}
        >
          다시 추천
        </Button>

        <Button
          className="bg-primary-normal hover:bg-primary-normal-hover flex-1 rounded-md px-4 py-2 text-[#FFF]"
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

      {/* 1) 로그인 상태: 제외 확인 모달 */}
      {showExcludeConfirmModal && (
        <ModalWrapper>
          <BaseModal
            title={"추천 목록에서 메뉴를\n 제외하시겠어요?"}
            leftButtonText="취소"
            rightButtonText="제외하기"
            isCloseButtonShow={false}
            onRightButtonClick={handleExcludeConfirm}
            onLeftButtonClick={() => {
              setShowExcludeConfirmModal(false);
              setExcludeMenu(null);
            }}
          />
        </ModalWrapper>
      )}

      {/* 2) 비로그인: 다시추천 3회 이상 로그인 유도 모달(A) */}
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

      {/* 3) 비로그인: 제외하기(마이너스) 로그인 유도 모달(B) */}
      {showLoginModalForExclude && (
        <ModalWrapper>
          <BaseModal
            title="더 많은 기능을 원하시나요?"
            desc="로그인 후 더 다양한 서비스를 누려보세요"
            rightButtonText="로그인하기"
            isLogoShow
            isCloseButtonShow={false}
            onRightButtonClick={handleLoginButton}
          />
        </ModalWrapper>
      )}

      {/* 4) 홈으로(추천 중단) 모달 */}
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
      {showHomeModal && (
        <ModalWrapper>
          <BaseModal
            title="메뉴추천을 중단하시겠어요?"
            leftButtonText="그만하기"
            rightButtonText="계속하기"
            onCloseClick={() => setShowHomeModal(false)}
            onLeftButtonClick={() => {
              setShowHomeModal(false);
              router.push("/mainpage");
            }}
            onRightButtonClick={() => setShowHomeModal(false)}
          />
        </ModalWrapper>
      )}
      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </div>
  );
}
