"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  FloatingActionButton,
  RecommendedFoodBox,
  SelectTab,
} from "@/widgets/mypage";

import {
  useExceptMenuMutation,
  useRecommendManagement,
  useRemoveExceptMenuMutation,
} from "@/entities/user";

import { MENU_SUGGESTIONS } from "@/shared/constants/mypage";
import { Header, SearchBar } from "@/shared/index";
import { useToast } from "@/shared/lib/useToast";
import { Toast } from "@/shared/ui/toast/Toast";

const TAB = {
  RECOMMEND: 0,
  EXCEPT: 1,
} as const;

export default function RecommendedListPage() {
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFAB, setShowFAB] = useState(false);
  const [toastState, setToastState] = useState<"success" | "error">("success");
  const { show, message, triggerToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data, isLoading } = useRecommendManagement();
  const exceptMutation = useExceptMenuMutation();
  const removeExceptMutation = useRemoveExceptMenuMutation();

  const currentMenus = useMemo(() => {
    const menus =
      selectedIndex === TAB.RECOMMEND
        ? (data?.recommendMenus ?? [])
        : (data?.exceptedMenus ?? []);

    if (!searchTerm.trim()) return menus;

    const term = searchTerm.trim().toLowerCase();
    return menus.filter((menu) => menu.name.toLowerCase().includes(term));
  }, [data, selectedIndex, searchTerm]);

  const handleToggle = (menuId: string) => {
    const callbacks = {
      onSuccess: () => {
        setToastState("success");
        triggerToast(
          selectedIndex === TAB.RECOMMEND
            ? "제외 목록에 추가되었습니다."
            : "추천 목록으로 복원되었습니다.",
        );
      },
      onError: () => {
        setToastState("error");
        triggerToast("처리 중 오류가 발생했습니다.");
      },
    };

    if (selectedIndex === TAB.RECOMMEND) {
      exceptMutation.mutate({ menuId }, callbacks);
    } else {
      removeExceptMutation.mutate({ menuId }, callbacks);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header
        title="추천 목록 관리"
        onBackClick={() => router.push("/mypage")}
      />

      <main className="relative mt-2 flex flex-col items-center gap-5 pb-8">
        <SelectTab
          tabs={["추천 목록", "제외 목록"]}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
        <SearchBar
          inputValue={searchTerm}
          setInputValue={setSearchTerm}
          onSearch={handleSearch}
          suggestionList={MENU_SUGGESTIONS}
        />

        {isLoading ? (
          <div className="text-font-low flex h-40 items-center justify-center">
            불러오는 중...
          </div>
        ) : currentMenus.length === 0 ? (
          <div className="text-font-low flex h-40 items-center justify-center">
            {searchTerm.trim()
              ? "검색 결과가 없습니다."
              : selectedIndex === TAB.RECOMMEND
                ? "추천 메뉴가 없습니다."
                : "제외된 메뉴가 없습니다."}
          </div>
        ) : (
          <section className="grid w-84 grid-cols-3 gap-3 pb-15">
            {currentMenus.map((menu) => (
              <RecommendedFoodBox
                key={menu.id}
                title={menu.name}
                src={menu.image_link}
                onClick={() => handleToggle(menu.id)}
                isToggled={selectedIndex === TAB.EXCEPT}
              />
            ))}
          </section>
        )}

        <FloatingActionButton
          onClick={scrollToTop}
          className={
            showFAB
              ? "opacity-100 transition-opacity duration-300"
              : "pointer-events-none opacity-0 transition-opacity duration-300"
          }
        />
      </main>
      <Toast
        message={message}
        show={show}
        state={toastState}
        className="bottom-20"
      />
    </>
  );
}
