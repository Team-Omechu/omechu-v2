"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Header, Input, Toast } from "@/shared";
import { FoodBox } from "@/shared";
import { BattleButton } from "@/shared";
import { Button } from "@/shared";
import { fetchJSON } from "@/shared/api/fetchJSON";

interface Menu {
  id: string;
  name: string;
  image_link: string | null;
}

export default function MenuBattlePage() {
  const router = useRouter();

  /* 상단 "이미 방 번호가 있나요?" 입력값 */
  const [joinCode, setJoinCode] = useState("");

  /* 방 상태 */
  const [battleName, setBattleName] = useState("오늘의 메뉴 배틀");
  const [roomNumber, setRoomNumber] = useState("2134");
  const [search, setSearch] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* Toast 상태 */
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  /* =====================
   * 전체 메뉴 로딩 상태 (API 연동)
   * menuId 이후부터 16개씩 가져오는 방식이므로 무한스크롤로 처리
   * ===================== */
  const [menus, setMenus] = useState<Menu[]>([]);
  const [lastMenuId, setLastMenuId] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchMenus = useCallback(async () => {
    if (isLoadingMenus || !hasMore) return;

    setIsLoadingMenus(true);

    try {
      const data = await fetchJSON<Menu[]>(`/menu/allMenu/${lastMenuId}`);

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      setMenus((prev) => {
        const merged = [...prev, ...data];

        const unique = Array.from(
          new Map(merged.map((menu) => [menu.id, menu])).values(),
        );

        return unique;
      });

      const nextLastId = Number(data[data.length - 1].id);
      setLastMenuId(nextLastId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMenus(false);
    }
  }, [isLoadingMenus, hasMore, lastMenuId]);

  // 무한 스크롤 트리거
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMenus();
        }
      },
      { threshold: 1 },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [lastMenuId, hasMore, isLoadingMenus, fetchMenus]);

  // 최초 1회 로딩
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  /* 방 번호 참여 처리 */
  const handleEnterByCode = async () => {
    const code = joinCode.trim();

    if (!code) {
      setToastMessage("참여 코드를 입력해주세요.");
      setShowToast(true);
      return;
    }

    const exists = await checkRoomExists(code);

    if (exists) {
      // ✅ 테스트용: 바로 play 페이지로 이동
      router.push(`/menu-battle/play/${code}`);
    } else {
      setToastMessage(
        "방이 존재하지 않습니다.\n참여 코드를 다시 확인해 주세요.",
      );
      setShowToast(true);
    }
  };

  /* 메뉴 필터링 */
  const filteredMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) => m.name.toLowerCase().includes(q));
  }, [search, menus]);

  // 선택은 menu "id" 기준으로 관리 (이름 중복/변경 대비)
  const toggleMenu = (id: string) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* 배틀방 생성 */
  const handleCreateBattle = async () => {
    if (selectedMenus.length < 2) {
      setToastMessage("메뉴는 최소 2개 이상 선택해야 합니다.");
      setShowToast(true);
      return;
    }

    try {
      const result = await fetchJSON<{
        battleId: string;
      }>(`/menu/battles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorNickname: "방장",
          menuIds: selectedMenus, // ✅ 실제 메뉴 id로 전송
        }),
      });

      setRoomNumber(result.battleId);
      setShowCreateModal(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setToastMessage(e.message);
        setShowToast(true);
      } else {
        setToastMessage("알 수 없는 오류가 발생했습니다.");
        setShowToast(true);
      }
    }
  };

  /* (중요) 방 존재 여부 체크 */
  const checkRoomExists = async (battleId: string) => {
    try {
      await fetchJSON(`/menu/battles/${battleId}`);
      return true;
    } catch {
      return false;
    }
  };

  /* 공유 처리 */
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/menu-battle/play/${roomNumber}?battleName=${encodeURIComponent(
      battleName,
    )}`;

    // Web Share API 지원 브라우저
    if (navigator.share) {
      try {
        await navigator.share({
          title: "메뉴 배틀 초대",
          text: `${battleName}에 초대되었어요!`,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유 취소한 경우 -> 의도적으로 무시
      }
    } else {
      // fallback: 클립보드 복사
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage("링크가 복사되었습니다.");
      setShowToast(true);
    }
  };

  /* Toast 자동 사라짐 처리 */
  useEffect(() => {
    if (!showToast) return;

    const timer = setTimeout(() => {
      setShowToast(false);
    }, 2500); // 2.5초 후 사라짐

    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <main className="min-h-screen pb-32">
      {/* 상단 */}
      <Header title="메뉴 배틀" showProfileButton showHomeButton={false} />

      {/* 이미 방 번호가 있나요? */}
      <section className="mt-2 px-4">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-body-4-medium text-font-high">
            이미 방 번호가 있나요?
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="참여 코드"
              className="border-font-disabled text-font-high text-caption-1 h-10 flex-1 border bg-white"
            />

            {/* 시안의 작은 '입장' 버튼 */}
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

      {/* 배틀방 이름 */}
      <section className="mt-2 px-4">
        <p className="mb-2 text-lg font-normal">배틀방 이름</p>
        <Input
          value={battleName}
          onChange={(e) => setBattleName(e.target.value)}
          placeholder="배틀방 이름을 입력하세요"
          className="w-full border-none bg-white"
        />
      </section>

      {/* 검색 */}
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

      {/* 메뉴 리스트 */}
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

        {/* 무한 스크롤 트리거 */}
        {hasMore && <div ref={observerRef} className="h-10" />}

        {isLoadingMenus && (
          <p className="text-caption-2 text-font-placeholder mt-4 text-center">
            메뉴 불러오는 중…
          </p>
        )}
      </section>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-0 w-full">
        <footer className="mx-auto w-full max-w-120 rounded-t-2xl bg-white px-6 py-5 shadow">
          <div className="flex items-center justify-between">
            {/* 왼쪽 텍스트 */}
            <div>
              <p className="text-body-4 text-font-high">선택된 메뉴</p>
              <p className="text-body-4 text-font-placeholder">
                {selectedMenus.length}개
              </p>
            </div>

            {/* 오른쪽 버튼 */}
            <BattleButton
              width="md"
              disabled={selectedMenus.length === 0}
              onClick={handleCreateBattle}
              className={`px-6 ${
                selectedMenus.length === 0
                  ? "bg-statelayer-disabled text-white"
                  : "bg-statelayer-default text-white"
              }`}
            >
              배틀방 생성
            </BattleButton>
          </div>
        </footer>
      </div>

      {/* 생성 완료 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="relative w-full max-w-sm rounded-2xl bg-white px-3.75 py-3.75 text-center">
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3.75 right-3.75"
              aria-label="닫기"
            >
              <Image src="/x/close_big.svg" alt="닫기" width={20} height={20} />
            </button>

            {/* 타이틀 */}
            <div className="pt-6">
              <h3 className="text-body-3-medium wrap-break-word">
                [{battleName}] 생성 완료!
              </h3>
            </div>

            {/* 설명 */}
            <p className="text-caption-1 text-font-placeholder mt-2">
              아래 링크를 친구들과 공유하세요
            </p>

            {/* 방 번호 박스 */}
            <div className="border-font-disabled mt-3 rounded-xl border px-4 py-3">
              <p className="text-caption-2 text-font-placeholder">방 번호</p>
              <p className="text-body-4-medium text-font-high mt-1">
                {roomNumber}
              </p>
            </div>

            {/* 버튼 영역 */}
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
                onClick={() =>
                  router.push(
                    `/menu-battle/play/${roomNumber}?battleName=${encodeURIComponent(
                      battleName,
                    )}`,
                  )
                }
              >
                바로 참여하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        show={showToast}
        state="error"
        message={toastMessage}
        className="bottom-32"
      />
    </main>
  );
}
