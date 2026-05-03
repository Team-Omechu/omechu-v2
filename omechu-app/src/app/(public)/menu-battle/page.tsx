"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { menuBattleAPI } from "@/shared/api/menuBattle.api";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

import { Button, FoodBox, Header, Input, Toast, useToast } from "@/shared";

interface Menu {
  id: string;
  name: string;
  image_link: string | null;
}

const MIN_MENU_SELECTION = 2;
const MAX_MENU_SELECTION = 8;
const MENU_SELECTION_MESSAGE = "메뉴는 2개에서 8개 사이로 선택해야 합니다";

async function fetchAllMenus(): Promise<Menu[]> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb
    .from("menu")
    .select("id, name, image_link")
    .order("id");
  if (error) throw error;
  return (
    (data ?? []) as { id: number; name: string; image_link: string | null }[]
  ).map((m) => ({
    id: String(m.id),
    name: m.name,
    image_link: m.image_link,
  }));
}

export default function MenuBattlePage() {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState("");
  const [battleName, setBattleName] = useState("오늘의 메뉴 배틀");
  const [roomNumber, setRoomNumber] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    show: showToast,
    message: toastMessage,
    triggerToast: openToast,
  } = useToast();

  const {
    data: menus = [],
    error: menusError,
    isLoading: isLoadingMenus,
  } = useQuery<Menu[]>({
    queryKey: ["menu", "allMenu"] as const,
    queryFn: fetchAllMenus,
    staleTime: 5 * 60 * 1000,
  });

  const filteredMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((menu) => menu.name.toLowerCase().includes(q));
  }, [menus, search]);

  const toggleMenu = (id: string) => {
    setSelectedMenus((prev) => {
      if (prev.includes(id)) {
        return prev.filter((menuId) => menuId !== id);
      }

      if (prev.length >= MAX_MENU_SELECTION) {
        openToast(MENU_SELECTION_MESSAGE);
        return prev;
      }

      return [...prev, id];
    });
  };

  const handleEnterByCode = async () => {
    const code = joinCode.trim();
    if (!code) {
      openToast("참여 코드를 입력해주세요.");
      return;
    }

    try {
      await menuBattleAPI.getBattle(code);
      router.push(`/menu-battle/play/${code}`);
    } catch {
      openToast("존재하지 않는 배틀방입니다.");
    }
  };

  const handleCreateBattle = async () => {
    if (
      selectedMenus.length < MIN_MENU_SELECTION ||
      selectedMenus.length > MAX_MENU_SELECTION
    ) {
      openToast(MENU_SELECTION_MESSAGE);
      return;
    }

    const payload = {
      menuIds: selectedMenus.map(Number),
    };

    try {
      const result = await menuBattleAPI.createBattle(payload);
      setRoomNumber(result.battleId);
      setShowCreateModal(true);
    } catch (error) {
      console.error("[MenuBattle] create battle failed", {
        payload,
        error,
      });
      if (error instanceof Error && error.message) {
        openToast(`배틀방 생성 실패: ${error.message}`);
        return;
      }
      openToast("배틀방 생성에 실패했습니다.");
    }
  };

  const makeBattlePlayUrl = useCallback(
    (battleId: string) => {
      const params = new URLSearchParams({
        battleName,
      });
      return `/menu-battle/play/${battleId}?${params.toString()}`;
    },
    [battleName],
  );

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${makeBattlePlayUrl(roomNumber)}`;
    const shareMessage = `💌 오늘의 메뉴 배틀에 초대합니다.
🔑  입장 코드: ${roomNumber}

코드를 입력하거나 아래 링크를 눌러서 지금 바로 배틀에 참여하세요!

${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "오늘의 메뉴 배틀 초대",
          text: shareMessage,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareMessage);
      openToast("초대 문구가 복사되었습니다.");
    } catch {
      openToast("복사에 실패했습니다. 직접 복사해 주세요.");
    }
  };

  return (
    <main className="min-h-screen pb-32">
      <Header
        title="오늘의 메뉴 배틀"
        showBackButton={false}
        homeModalTitle="메뉴 배틀을 중단하시겠어요?"
        homeModalLeftText="그만하기"
        homeModalRightText="계속하기"
      />

      <section className="mt-2 px-4">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-body-4-medium text-font-high">
            이미 방 번호가 있나요?
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="예: 2314"
              className="border-font-disabled text-font-high text-caption-1 h-10 flex-1 border bg-white"
            />
            <button
              type="button"
              onClick={handleEnterByCode}
              className="bg-font-medium text-caption-1 disabled:bg-font-disabled h-10 w-16 rounded-xl text-white"
              disabled={!joinCode.trim()}
            >
              입장
            </button>
          </div>
        </div>
      </section>

      <section className="mt-2 px-4">
        <p className="mb-2 text-lg font-normal">배틀방 이름</p>
        <Input
          value={battleName}
          onChange={(e) => setBattleName(e.target.value)}
          placeholder="배틀방 이름을 입력하세요"
          className="w-full border-none bg-white"
        />
      </section>

      <section className="mt-6 px-4">
        <p className="mb-2 text-lg font-normal">후보 메뉴</p>
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="음식명을 검색하세요"
          className="flex w-full items-center border-none bg-white"
        />
      </section>

      <section className="mt-6 px-4">
        <div className="grid grid-cols-3 justify-items-center gap-4">
          {filteredMenus.map((food) => (
            <FoodBox
              key={food.id}
              src={food.image_link || "/sample/sample-pasta.png"}
              title={food.name}
              isSelected={selectedMenus.includes(food.id)}
              onClick={() => toggleMenu(food.id)}
            />
          ))}
        </div>

        {isLoadingMenus && (
          <p className="text-caption-2 text-font-placeholder mt-4 text-center">
            메뉴 불러오는 중...
          </p>
        )}

        {menusError && !isLoadingMenus && (
          <p className="text-caption-2 mt-4 text-center text-red-500">
            메뉴를 불러오지 못했습니다.
          </p>
        )}
      </section>

      <div className="fixed bottom-0 left-0 w-full">
        <footer className="mx-auto w-full max-w-120 rounded-t-2xl bg-white px-6 py-5 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-4 text-font-high">선택된 메뉴</p>
              <p className="text-body-4 text-font-placeholder">
                {selectedMenus.length}개
              </p>
            </div>

            <Button
              width="md"
              radius="md"
              disabled={
                selectedMenus.length < MIN_MENU_SELECTION ||
                selectedMenus.length > MAX_MENU_SELECTION
              }
              onClick={handleCreateBattle}
              className={`px-6 ${
                selectedMenus.length < MIN_MENU_SELECTION ||
                selectedMenus.length > MAX_MENU_SELECTION
                  ? "bg-statelayer-disabled text-white"
                  : "bg-statelayer-default text-white"
              }`}
            >
              배틀방 생성
            </Button>
          </div>
        </footer>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="relative w-full max-w-sm rounded-2xl bg-white px-3.75 py-3.75 text-center">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3.75 right-3.75"
              aria-label="닫기"
            >
              <Image src="/x/close_big.svg" alt="닫기" width={20} height={20} />
            </button>

            <div className="pt-6">
              <h3 className="text-body-3-medium wrap-break-word">
                [{battleName}] 생성 완료!
              </h3>
            </div>

            <p className="text-caption-1 text-font-placeholder mt-2">
              아래 링크를 친구들과 공유하세요
            </p>

            <div className="border-font-disabled mt-3 rounded-xl border px-4 py-3">
              <p className="text-caption-2 text-font-placeholder">방 번호</p>
              <p className="text-body-4-medium text-font-high mt-1">
                {roomNumber}
              </p>
            </div>

            <div className="mt-3 flex gap-3">
              <Button
                width="md"
                bgColor="grey"
                className="text-font-medium flex-1"
                onClick={handleShare}
              >
                공유하기
              </Button>

              <Button
                width="md"
                className="bg-statelayer-default flex-1 text-white"
                onClick={() => router.push(makeBattlePlayUrl(roomNumber))}
              >
                바로 참여하기
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={showToast}
        state="error"
        message={toastMessage}
        className="bottom-32"
      />
    </main>
  );
}
