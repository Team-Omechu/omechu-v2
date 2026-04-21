"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BattleBoard,
  BattleResult,
  Roulette,
  type RouletteHandle,
} from "@/widgets/menu-battle";

import {
  type BattleResponse,
  type Menu,
  type Player,
  type Ranking,
  type Winner,
} from "@/entities/menu-battle";

import { menuBattleAPI } from "@/shared/api/menuBattle.api";

import { Button, Header, Input, Toast, useToast } from "@/shared";

const BAR_COLORS = ["#FF9029", "#00A3FF", "#5AD886", "#FDDC3F", "#C48CFD"];

type SpinResult = BattleResponse["spinResults"][number];

const toSpinKey = (result: SpinResult) => `${result.nickname}-${result.spunAt}`;

const mergeSpinResults = (prev: SpinResult[], incoming: SpinResult[]) => {
  const map = new Map<string, SpinResult>();
  for (const item of prev) map.set(toSpinKey(item), item);
  for (const item of incoming) map.set(toSpinKey(item), item);
  return Array.from(map.values());
};

const battleQueryKey = (battleId: string | undefined) =>
  ["battle", battleId] as const;

export default function PlayPage() {
  const { id: battleId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const battleNameFromQuery = searchParams.get("battleName");
  const initialNickname = searchParams.get("nickname");

  const battleName = useMemo(
    () =>
      battleNameFromQuery
        ? decodeURIComponent(battleNameFromQuery)
        : "오늘의 메뉴 배틀",
    [battleNameFromQuery],
  );

  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [showNicknameModal, setShowNicknameModal] = useState(!initialNickname);
  const [isSubmittingNickname, setIsSubmittingNickname] = useState(false);

  const {
    show: showToast,
    message: toastMessage,
    triggerToast: openToast,
  } = useToast();

  const [isSubmittingSpin, setIsSubmittingSpin] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const isSpinningRef = useRef(false);
  const rouletteRef = useRef<RouletteHandle | null>(null);

  // 배틀 상태: 2초 폴링. finished면 폴링 중단.
  const { data: battleData, error: battleError } = useQuery<BattleResponse>({
    queryKey: battleQueryKey(battleId),
    queryFn: () =>
      menuBattleAPI.getBattle(battleId!) as Promise<BattleResponse>,
    enabled: !!battleId,
    refetchInterval: (query) =>
      query.state.data?.status === "finished" ? false : 2000,
  });

  const finished = battleData?.status === "finished";

  // 순위: 동일 주기 폴링.
  const { data: rankingsData } = useQuery<Ranking[]>({
    queryKey: ["battle", battleId, "rankings"] as const,
    queryFn: async () => {
      const data = await menuBattleAPI.getRankings(battleId!);
      if (Array.isArray(data)) return data;
      const rankings = (data as { rankings?: Ranking[] })?.rankings;
      return Array.isArray(rankings) ? rankings : [];
    },
    enabled: !!battleId,
    refetchInterval: finished ? false : 2000,
  });
  const rankings = rankingsData ?? [];

  // 생성자 여부: 닉네임이 정해졌을 때만 조회.
  const { data: isCreatorData } = useQuery<boolean>({
    queryKey: ["battle", battleId, "isCreator", nickname] as const,
    queryFn: async () => {
      const info = await menuBattleAPI.isCreator(battleId!, nickname);
      return info.isCreator;
    },
    enabled: !!battleId && !!nickname,
  });
  const isCreator =
    isCreatorData ??
    (battleData ? battleData.creatorNickname === nickname : false);

  // 배틀 응답에서 파생되는 UI 상태.
  const menus: Menu[] = useMemo(() => {
    if (!battleData) return [];
    return battleData.menus.map((menu, index) => ({
      menuId: menu.menuId,
      menuName: menu.menuName,
      centerAngle: menu.boundaryAngle,
      color: BAR_COLORS[index % BAR_COLORS.length] ?? BAR_COLORS[0]!,
    }));
  }, [battleData]);

  const players: Player[] = useMemo(() => {
    if (!battleData) return [];
    return battleData.participants.map((participant) => ({
      id: participant.nickname,
      name: participant.nickname,
      joinedAt: new Date(participant.joinedAt).getTime(),
    }));
  }, [battleData]);

  const creatorNickname = battleData?.creatorNickname ?? "";
  const spinHistory: SpinResult[] = useMemo(
    () => battleData?.spinResults ?? [],
    [battleData],
  );

  const winner: Winner | null = useMemo(() => {
    const ranked = battleData?.spinResults.find((result) => result.rank === 1);
    if (!ranked) return null;
    return {
      nickname: ranked.nickname,
      closestMenuName: ranked.closestMenuName,
      distanceToBoundary: ranked.distanceToBoundary,
      rank: ranked.rank,
    };
  }, [battleData]);

  const hasMyStopped = useMemo(
    () => !!nickname && spinHistory.some((item) => item.nickname === nickname),
    [nickname, spinHistory],
  );

  // 배틀 로드 실패 시 토스트.
  const toastedErrorRef = useRef<unknown>(null);
  useEffect(() => {
    if (battleError && toastedErrorRef.current !== battleError) {
      toastedErrorRef.current = battleError;
      openToast("배틀방 정보를 불러오지 못했습니다.");
    }
  }, [battleError, openToast]);

  useEffect(() => {
    if (!battleId || !nickname || finished) return;

    const leave = () => {
      void fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu/battles/${battleId}/participants/${encodeURIComponent(nickname)}`,
        { method: "DELETE", credentials: "include", keepalive: true },
      );
    };

    const handleBeforeUnload = () => leave();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leave();
    };
  }, [battleId, nickname, finished]);

  useEffect(() => {
    if (
      showNicknameModal ||
      finished ||
      hasMyStopped ||
      isSubmittingSpin ||
      menus.length === 0
    )
      return;
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    rouletteRef.current?.start();
  }, [
    finished,
    hasMyStopped,
    isSubmittingSpin,
    menus.length,
    showNicknameModal,
  ]);

  const isValidNickname = (value: string) =>
    /^[a-zA-Z0-9가-힣]{1,20}$/.test(value);

  const invalidateBattle = () =>
    queryClient.invalidateQueries({ queryKey: battleQueryKey(battleId) });

  const handleConfirmNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !isValidNickname(trimmed)) {
      openToast("닉네임은 영문/숫자/한글 1~20자로 입력해주세요.");
      return;
    }
    if (!battleId) return;

    try {
      setIsSubmittingNickname(true);
      await menuBattleAPI.joinBattle(battleId, trimmed);
      setNickname(trimmed);
      setShowNicknameModal(false);

      window.history.replaceState(
        null,
        "",
        `/menu-battle/play/${battleId}?nickname=${encodeURIComponent(trimmed)}&battleName=${encodeURIComponent(battleName)}`,
      );

      await invalidateBattle();
    } catch (error) {
      try {
        const battle = (await menuBattleAPI.getBattle(
          battleId,
        )) as BattleResponse;
        const alreadyJoined = battle.participants.some(
          (participant) => participant.nickname === trimmed,
        );

        if (alreadyJoined) {
          setNickname(trimmed);
          setShowNicknameModal(false);

          window.history.replaceState(
            null,
            "",
            `/menu-battle/play/${battleId}?nickname=${encodeURIComponent(trimmed)}&battleName=${encodeURIComponent(battleName)}`,
          );

          await invalidateBattle();
          return;
        }
      } catch {
        // ignore fallback errors
      }

      if (error instanceof Error && error.message) {
        openToast(error.message);
      } else {
        openToast("입장에 실패했습니다. 닉네임을 확인해주세요.");
      }
    } finally {
      setIsSubmittingNickname(false);
    }
  };

  const handleStop = async () => {
    if (!battleId || !nickname || finished || hasMyStopped) return;

    if (!isSpinningRef.current) {
      isSpinningRef.current = true;
      rouletteRef.current?.start();
      return;
    }

    // Stop immediately on click, then reconcile with server result.
    rouletteRef.current?.stop();
    isSpinningRef.current = false;

    try {
      setIsSubmittingSpin(true);
      const result = await menuBattleAPI.spin(battleId, nickname);
      await rouletteRef.current?.animateToAngle(result.stoppedAngle);

      // Optimistic update — 즉시 spinHistory에 반영.
      queryClient.setQueryData<BattleResponse>(
        battleQueryKey(battleId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            spinResults: mergeSpinResults(prev.spinResults, [
              {
                nickname: result.nickname,
                stoppedAngle: result.stoppedAngle,
                closestMenuName: result.closestMenuName,
                distanceToBoundary: result.distanceToBoundary,
                rank: result.rank,
                spunAt: result.spunAt,
              },
            ]),
          };
        },
      );
      await invalidateBattle();
    } catch {
      openToast("스핀에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmittingSpin(false);
    }
  };

  const handleFinish = async () => {
    if (!battleId || !nickname || !isCreator || finished) return;
    try {
      setIsFinishing(true);
      await menuBattleAPI.finish(battleId, nickname);
      await invalidateBattle();
    } catch {
      openToast("배틀 마감에 실패했습니다.");
    } finally {
      setIsFinishing(false);
    }
  };

  const ready = !showNicknameModal && !!nickname;

  return (
    <main className="min-h-screen px-4 text-center">
      <Header
        title={battleName}
        showBackButton={false}
        homeModalTitle="메뉴 배틀을 중단하시겠어요?"
        homeModalLeftText="그만하기"
        homeModalRightText="계속하기"
      />

      {ready && (
        <>
          <BattleBoard players={players} creatorNickname={creatorNickname} />

          <div className="py-10">
            <p className="text-font-high text-lg font-semibold">
              원하는 메뉴존의
              <br />
              타이밍에 맞춰 멈추세요!
            </p>
          </div>

          <Roulette ref={rouletteRef} menus={menus} disabled={finished} />

          {!finished && !hasMyStopped && (
            <button
              type="button"
              onClick={handleStop}
              disabled={isSubmittingSpin}
              className="bg-statelayer-default mt-4 w-40 rounded-xl py-3 font-semibold text-white disabled:opacity-40"
            >
              STOP
            </button>
          )}

          {!finished && isCreator && hasMyStopped && (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isFinishing}
              className="bg-statelayer-default mt-6 rounded-xl px-8 py-3 text-white disabled:opacity-40"
            >
              배틀 마감하기
            </button>
          )}

          {!finished && rankings.length > 0 && (
            <section className="my-8 space-y-3 text-left">
              {rankings.map((result) => (
                <div
                  key={result.nickname}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-2.5"
                >
                  <p className="text-body-3 text-font-high">
                    {result.rank}. {result.nickname}({result.closestMenuName})
                  </p>
                  <p className="text-body-3 text-font-high">
                    {Math.round(result.distanceToBoundary)}
                  </p>
                </div>
              ))}
            </section>
          )}

          {finished && <BattleResult winner={winner} rankings={rankings} />}
        </>
      )}

      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="border-font-disabled relative w-full max-w-[335px] rounded-[20px] border bg-white px-6 py-8 text-center">
            <button
              type="button"
              onClick={() => router.push("/menu-battle")}
              className="text-font-placeholder absolute top-3 right-3 text-xl"
              aria-label="닫기"
            >
              <Image src="/x/close_big.svg" alt="닫기" width={20} height={20} />
            </button>

            <div className="flex flex-col items-center gap-3.5">
              <h3 className="text-body-3-medium w-full wrap-break-word">
                {battleName}
              </h3>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="border-font-medium h-10 w-full max-w-[287px] rounded-md border bg-white"
              />
              <Button
                width="xl"
                className="bg-statelayer-default h-12 w-full max-w-[287px] text-white"
                onClick={handleConfirmNickname}
                disabled={isSubmittingNickname}
              >
                입장하기
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
