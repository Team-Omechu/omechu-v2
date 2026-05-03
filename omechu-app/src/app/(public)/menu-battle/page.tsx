"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";

import { menuBattleAPI, useEnsureBattleSession } from "@/entities/menu-battle";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

import {
  Button,
  FoodBox,
  Header,
  Input,
  Spinner,
  Toast,
  useToast,
} from "@/shared";

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
  useEnsureBattleSession();

  const [joinCode, setJoinCode] = useState("");
  const [battleName, setBattleName] = useState("오늘의 메뉴 배틀");
  const [createdBattleId, setCreatedBattleId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      setIsSubmitting(true);
      const result = await menuBattleAPI.createBattle({
        title: battleName,
        menuIds: selectedMenus.map(Number),
      });
      setCreatedBattleId(result.battleId);
      setShowCreateSheet(true);
    } catch (error) {
      const msg =
        error instanceof Error && error.message
          ? error.message
          : "배틀방 생성에 실패했습니다.";
      openToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeBattlePlayUrl = useCallback(
    (battleId: string) => {
      const params = new URLSearchParams({ battleName });
      return `/menu-battle/play/${battleId}?${params.toString()}`;
    },
    [battleName],
  );

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${makeBattlePlayUrl(createdBattleId)}`;
    const shareMessage = `💌 오늘의 메뉴 배틀에 초대합니다.
🔑  입장 코드: ${createdBattleId}

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

  const selectionCount = selectedMenus.length;
  const canCreate =
    selectionCount >= MIN_MENU_SELECTION &&
    selectionCount <= MAX_MENU_SELECTION;

  return (
    <main className="pb-32">
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
              placeholder="예: 482031"
              inputMode="numeric"
              maxLength={6}
              className="border-font-disabled text-font-high text-caption-1 h-10 flex-1 border bg-white"
            />
            <motion.button
              type="button"
              onClick={handleEnterByCode}
              whileTap={{ scale: 0.96 }}
              className="bg-font-medium text-caption-1 disabled:bg-font-disabled h-10 w-16 rounded-xl text-white"
              disabled={!joinCode.trim()}
            >
              입장
            </motion.button>
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
          {filteredMenus.map((food) => {
            const selected = selectedMenus.includes(food.id);
            return (
              <motion.div
                key={food.id}
                whileTap={{ scale: 0.94 }}
                animate={{ scale: selected ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                className="w-full"
              >
                <FoodBox
                  src={food.image_link || "/sample/sample-pasta.png"}
                  title={food.name}
                  isSelected={selected}
                  onClick={() => toggleMenu(food.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {isLoadingMenus && (
          <div className="mt-4 flex justify-center">
            <Spinner />
          </div>
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
              <motion.p
                key={selectionCount}
                initial={{ scale: 0.85, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
                className={`text-body-4 ${
                  canCreate
                    ? "text-statelayer-default"
                    : "text-font-placeholder"
                }`}
              >
                {selectionCount}개
              </motion.p>
            </div>

            <motion.div whileTap={{ scale: canCreate ? 0.96 : 1 }}>
              <Button
                width="md"
                radius="md"
                disabled={!canCreate || isSubmitting}
                onClick={handleCreateBattle}
                className={`px-6 ${
                  canCreate
                    ? "bg-statelayer-default text-white"
                    : "bg-statelayer-disabled text-white"
                }`}
              >
                배틀방 생성
              </Button>
            </motion.div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showCreateSheet && (
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-surface-dimmed fixed inset-0 z-40"
            onClick={() => setShowCreateSheet(false)}
          />
        )}

        {showCreateSheet && (
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-3 pb-8 shadow-2xl"
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-gray-200" />

            <div className="text-center">
              <h3 className="text-body-3-medium wrap-break-word">
                [{battleName}] 생성 완료!
              </h3>
              <p className="text-caption-1 text-font-placeholder mt-1">
                아래 코드를 친구들과 공유하세요
              </p>
            </div>

            <div className="border-line-strong mt-5 rounded-2xl border-2 border-dashed bg-gray-50 px-4 py-5 text-center">
              <p className="text-caption-2 text-font-placeholder">방 번호</p>
              <p className="text-font-high mt-1 text-3xl font-bold tracking-[0.2em] tabular-nums">
                {createdBattleId}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
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
                onClick={() => router.push(makeBattlePlayUrl(createdBattleId))}
              >
                바로 참여하기
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateSheet(false)}
              className="text-font-placeholder absolute top-4 right-4"
              aria-label="닫기"
            >
              <Image src="/x/close_big.svg" alt="닫기" width={20} height={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        show={showToast}
        state="error"
        message={toastMessage}
        className="bottom-32"
      />
    </main>
  );
}
