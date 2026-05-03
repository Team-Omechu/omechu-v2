"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";

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
  menuBattleAPI,
  useBattleRealtime,
  useEnsureBattleSession,
} from "@/entities/menu-battle";

import { Button, Header, Input, Toast, useToast } from "@/shared";

const BAR_COLORS = ["#FF9029", "#00A3FF", "#5AD886", "#FDDC3F", "#C48CFD"];

const battleQueryKey = (battleId: string | undefined) =>
  ["battle", battleId] as const;

export default function PlayPage() {
  const { id: battleId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const battleNameFromQuery = searchParams.get("battleName");
  const initialNickname = searchParams.get("nickname");

  const { ready: sessionReady, error: sessionError } = useEnsureBattleSession();

  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [showNicknameSheet, setShowNicknameSheet] = useState(!initialNickname);
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

  // 폴링 제거 — Realtime push로 갱신
  useBattleRealtime(battleId);

  const { data: battleData, error: battleError } = useQuery<BattleResponse>({
    queryKey: battleQueryKey(battleId),
    queryFn: () => menuBattleAPI.getBattle(battleId!),
    enabled: !!battleId && sessionReady,
  });

  const { data: rankingsData } = useQuery<Ranking[]>({
    queryKey: ["battle", battleId, "rankings"] as const,
    queryFn: () => menuBattleAPI.getRankings(battleId!),
    enabled: !!battleId && sessionReady,
  });
  const rankings = useMemo(() => rankingsData ?? [], [rankingsData]);

  const finished = battleData?.status === "finished";

  const battleName = useMemo(() => {
    if (battleData?.battleId && battleNameFromQuery)
      return decodeURIComponent(battleNameFromQuery);
    return "오늘의 메뉴 배틀";
  }, [battleData?.battleId, battleNameFromQuery]);

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
  const isCreator = creatorNickname === nickname;

  const spinHistory = useMemo(
    () => battleData?.spinResults ?? [],
    [battleData],
  );

  const winner: Winner | null = useMemo(() => {
    const top = rankings[0] ?? null;
    if (!top) return null;
    return {
      nickname: top.nickname,
      closestMenuName: top.closestMenuName,
      distanceToBoundary: top.distanceToBoundary,
      rank: 1,
    };
  }, [rankings]);

  const hasMyStopped = useMemo(
    () => !!nickname && spinHistory.some((item) => item.nickname === nickname),
    [nickname, spinHistory],
  );

  const totalPlayers = players.length;
  const stoppedCount = spinHistory.length;

  const toastedErrorRef = useRef<unknown>(null);
  useEffect(() => {
    const err = battleError ?? sessionError;
    if (err && toastedErrorRef.current !== err) {
      toastedErrorRef.current = err;
      openToast(
        err instanceof Error && err.message
          ? err.message
          : "배틀방 정보를 불러오지 못했습니다.",
      );
    }
  }, [battleError, sessionError, openToast]);

  // 닉네임 확정된 후 자동으로 룰렛 회전 시작
  useEffect(() => {
    if (
      showNicknameSheet ||
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
    showNicknameSheet,
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
      setShowNicknameSheet(false);

      window.history.replaceState(
        null,
        "",
        `/menu-battle/play/${battleId}?nickname=${encodeURIComponent(trimmed)}&battleName=${encodeURIComponent(battleName)}`,
      );

      await invalidateBattle();
    } catch (error) {
      openToast(
        error instanceof Error && error.message
          ? error.message
          : "입장에 실패했습니다.",
      );
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

    rouletteRef.current?.stop();
    isSpinningRef.current = false;

    try {
      setIsSubmittingSpin(true);
      const result = await menuBattleAPI.spin(battleId, nickname);
      await rouletteRef.current?.animateToAngle(result.stoppedAngle);
      await invalidateBattle();
    } catch (error) {
      openToast(
        error instanceof Error && error.message
          ? error.message
          : "스핀에 실패했습니다.",
      );
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
    } catch (error) {
      openToast(
        error instanceof Error && error.message
          ? error.message
          : "배틀 마감에 실패했습니다.",
      );
    } finally {
      setIsFinishing(false);
    }
  };

  const ready = !showNicknameSheet && !!nickname;
  const progressPct =
    totalPlayers === 0 ? 0 : Math.min(100, (stoppedCount / totalPlayers) * 100);

  return (
    <main className="px-4 text-center">
      <Header
        title={battleName}
        showBackButton={false}
        homeModalTitle="메뉴 배틀을 중단하시겠어요?"
        homeModalLeftText="그만하기"
        homeModalRightText="계속하기"
      />

      {ready && (
        <>
          {/* 진행 게이지 */}
          {totalPlayers > 0 && !finished && (
            <div className="mt-4 px-1">
              <div className="text-caption-2 text-font-placeholder mb-1.5 flex justify-between">
                <span>결정 완료</span>
                <span className="tabular-nums">
                  {stoppedCount} / {totalPlayers}
                </span>
              </div>
              <div className="bg-component-default h-1.5 w-full overflow-hidden rounded-full">
                <motion.div
                  className="bg-statelayer-default h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                />
              </div>
            </div>
          )}

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
            <motion.button
              type="button"
              onClick={handleStop}
              disabled={isSubmittingSpin}
              whileTap={{ scale: 0.94 }}
              className="bg-statelayer-default mt-4 w-40 rounded-xl py-3 font-semibold text-white disabled:opacity-40"
            >
              STOP
            </motion.button>
          )}

          {!finished && isCreator && hasMyStopped && (
            <motion.button
              type="button"
              onClick={handleFinish}
              disabled={isFinishing}
              whileTap={{ scale: 0.96 }}
              className="bg-statelayer-default mt-6 rounded-xl px-8 py-3 text-white disabled:opacity-40"
            >
              배틀 마감하기
            </motion.button>
          )}

          {!finished && rankings.length > 0 && (
            <section className="my-8 space-y-3 text-left">
              <AnimatePresence initial={false}>
                {rankings.map((result) => (
                  <motion.div
                    key={result.nickname}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 26,
                    }}
                    className="flex items-center justify-between rounded-xl border bg-white px-4 py-2.5"
                  >
                    <p className="text-body-3 text-font-high">
                      {result.rank}. {result.nickname}({result.closestMenuName})
                    </p>
                    <p className="text-body-3 text-font-high tabular-nums">
                      {Math.round(result.distanceToBoundary)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          )}

          {finished && <BattleResult winner={winner} rankings={rankings} />}
        </>
      )}

      <AnimatePresence>
        {showNicknameSheet && (
          <motion.div
            key="nick-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-surface-dimmed fixed inset-0 z-40"
            onClick={() => router.push("/menu-battle")}
          />
        )}

        {showNicknameSheet && (
          <motion.div
            key="nick-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-3 pb-8 shadow-2xl"
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-gray-200" />

            <div className="text-center">
              <h3 className="text-body-3-medium wrap-break-word">
                {battleName}
              </h3>
              <p className="text-caption-1 text-font-placeholder mt-1">
                닉네임을 입력하고 입장해주세요
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 (영문/숫자/한글 1~20자)"
                maxLength={20}
                className="border-font-medium h-12 w-full rounded-xl border bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleConfirmNickname();
                }}
              />
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  width="xl"
                  className="bg-statelayer-default h-12 w-full text-white"
                  onClick={handleConfirmNickname}
                  disabled={isSubmittingNickname || !sessionReady}
                >
                  입장하기
                </Button>
              </motion.div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/menu-battle")}
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
