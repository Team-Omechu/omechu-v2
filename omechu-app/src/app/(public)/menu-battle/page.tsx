/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useMemo, useState, useEffect, useRef } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Header, Input, Toast } from "@/shared";
import { FoodBox } from "@/shared";
import { BattleButton } from "@/shared";
import { Button } from "@/shared";
import { fetchJSON } from "@/shared/api/fetchJSON";
import { menuBattleAPI } from "@/shared/api/menuBattle.api";

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

  /* 참여(Join) 관련 상태 */
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");

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

  const fetchMenus = async () => {
    if (isLoadingMenus || !hasMore) return;

    setIsLoadingMenus(true);

    try {
      // NOTE: fetchJSON이 baseURL을 붙여주는 구조라고 가정하고 상대경로 사용
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

      // 다음 요청을 위한 마지막 id 갱신
      const nextLastId = Number(data[data.length - 1].id);
      setLastMenuId(nextLastId);
    } catch (e) {
      console.error(e);
      // 필요 시 Toast로 노출 가능
      // setToastMessage("메뉴 목록을 불러오지 못했습니다.");
      // setShowToast(true);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  // 최초 1회 로딩
  useEffect(() => {
    fetchMenus();
  }, []);

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
  }, [observerRef.current, lastMenuId, hasMore, isLoadingMenus]);

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
          creatorNickname: nickname || "방장",
          menuIds: selectedMenus, // ✅ 실제 메뉴 id로 전송
        }),
      });

      setRoomNumber(result.battleId);
      setShowCreateModal(true);
    } catch (e: any) {
      setToastMessage(e.message);
      setShowToast(true);
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

  /* =====================
   * Join 흐름 여부
   * 지금 페이지에서는 false
   * TODO: join 페이지 분리 후 true
   * ===================== */
  const isJoinFlow = false;

  useEffect(() => {
    if (!isJoinFlow) return;

    const run = async () => {
      const exists = await checkRoomExists(roomNumber);

      if (exists) {
        setShowNicknameModal(true);
      } else {
        setToastMessage(
          "방이 존재하지 않습니다.\n참여 코드를 다시 확인해 주세요.",
        );
        setShowToast(true);
      }
    };

    run();
  }, []);

  /* 닉네임 검증*/
  const isValidNickname = (value: string) => {
    const regex = /^[a-zA-Z0-9가-힣]{1,20}$/;
    return regex.test(value);
  };

  /* 방 참여 처리 */
  const handleJoinRoom = async () => {
    // 1️⃣ 프론트에서 할 수 있는 최소 검증만
    if (!isValidNickname(nickname)) {
      setToastMessage("닉네임은 한/영/숫자 1~20자만 가능합니다.");
      setShowToast(true);
      return;
    }

    try {
      // 2️⃣ 서버에 참가 요청
      await menuBattleAPI.joinBattle(roomNumber, nickname);

      // 3️⃣ 모달 닫기
      setShowNicknameModal(false);

      // 4️⃣ play 페이지로 이동 (닉네임 전달 중요)
      router.push(`/menu-battle/play/${roomNumber}?nickname=${nickname}`);
    } catch (e: any) {
      // 5️⃣ 서버 에러 메시지 그대로 UX에 사용
      setToastMessage(e.message);
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
              >
                공유하기
              </Button>

              <Button
                width="md"
                className="bg-statelayer-default flex-1 text-white"
                onClick={() => setShowNicknameModal(true)}
              >
                바로 참여하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 닉네임 입력 모달 (join 전용) */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="relative w-full max-w-sm rounded-2xl bg-white px-3.75 py-3.75 text-center">
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowNicknameModal(false)}
              className="text-font-placeholder absolute top-3.75 right-3.75 text-xl"
              aria-label="닫기"
            >
              <Image src="/x/close_big.svg" alt="닫기" width={20} height={20} />
            </button>

            <div className="pt-6">
              <h3 className="text-body-3-medium wrap-break-word">
                {battleName}
              </h3>
            </div>

            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="mt-4 w-full"
            />
            <Button
              width="xl"
              className="bg-statelayer-default mt-3 w-full text-white"
              onClick={handleJoinRoom}
            >
              입장하기
            </Button>
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
