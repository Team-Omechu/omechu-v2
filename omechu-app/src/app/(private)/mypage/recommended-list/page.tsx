"use client";

import { useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  useRecommendManagement,
  useExceptMenuMutation,
  useRemoveExceptMenuMutation,
} from "@/entities/user";
import { MENU_SUGGESTIONS } from "@/shared/constants/mypage";
import { Header, SearchBar } from "@/shared/index";
import {
  FloatingActionButton,
  RecommendedFoodBox,
  SelectTab,
} from "@/widgets/mypage/ui";

export default function RecommendedListPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useRecommendManagement();
  const exceptMutation = useExceptMenuMutation();
  const removeExceptMutation = useRemoveExceptMenuMutation();

  const currentMenus = useMemo(() => {
    const menus =
      selectedIndex === 0
        ? (data?.recommendMenus ?? [])
        : (data?.exceptedMenus ?? []);

    if (!searchTerm.trim()) return menus;

    const term = searchTerm.trim().toLowerCase();
    return menus.filter((menu) => menu.name.toLowerCase().includes(term));
  }, [data, selectedIndex, searchTerm]);

  const handleToggle = (menuId: string) => {
    if (selectedIndex === 0) {
      exceptMutation.mutate({ menuId });
    } else {
      removeExceptMutation.mutate({ menuId });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <Header
        title="추천 목록 관리"
        onBackClick={() => router.push("/mypage")}
      />

      <main
        ref={mainRef}
        className="relative mt-2 flex h-[91.5dvh] flex-col items-center gap-5 overflow-y-auto"
      >
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
              : selectedIndex === 0
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
                isToggled={selectedIndex === 1}
              />
            ))}
          </section>
        )}

        <FloatingActionButton onClick={scrollToTop} />
      </main>
    </>
  );
}
