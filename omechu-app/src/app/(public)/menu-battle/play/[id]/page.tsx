"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  BattleResponse,
  Menu,
  Player,
  Ranking,
  Winner,
} from "@/entities/menubattle";
import { Button, Header, Input, Toast } from "@/shared";
import { menuBattleAPI } from "@/shared/api/menuBattle.api";
import { BattleBoard, BattleResult } from "@/widgets/menubattle";
import { Roulette, RouletteHandle } from "@/widgets/menubattle/ui/Roulette";

const BAR_COLORS = ["#FF9029", "#00A3FF", "#5AD886", "#FDDC3F", "#C48CFD"];

type SpinResult = BattleResponse["spinResults"][number];

const toSpinKey = (result: SpinResult) => `${result.nickname}-${result.spunAt}`;

const mergeSpinResults = (prev: SpinResult[], incoming: SpinResult[]) => {
  const map = new Map<string, SpinResult>();
  for (const item of prev) map.set(toSpinKey(item), item);
  for (const item of incoming) map.set(toSpinKey(item), item);
  return Array.from(map.values());
};

export default function PlayPage() {
  const { id: battleId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [creatorNickname, setCreatorNickname] = useState("");
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSubmittingSpin, setIsSubmittingSpin] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);

  const rouletteRef = useRef<RouletteHandle | null>(null);

  const openToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  const updateFromBattle = useCallback((data: BattleResponse) => {
    setMenus(
      data.menus.map((menu, index) => ({
        menuId: menu.menuId,
        menuName: menu.menuName,
        centerAngle: menu.boundaryAngle,
        color: BAR_COLORS[index % BAR_COLORS.length],
      })),
    );

    setPlayers(
      data.participants.map((participant) => ({
        id: participant.nickname,
        name: participant.nickname,
        joinedAt: new Date(participant.joinedAt).getTime(),
      })),
    );

    setSpinHistory((prev) => mergeSpinResults(prev, data.spinResults));
    setCreatorNickname(data.creatorNickname);
    setFinished(data.status === "finished");

    const rankedWinner = data.spinResults.find((result) => result.rank === 1);
    if (rankedWinner) {
      setWinner({
        nickname: rankedWinner.nickname,
        closestMenuName: rankedWinner.closestMenuName,
        distanceToBoundary: rankedWinner.distanceToBoundary,
        rank: rankedWinner.rank,
      });
    }
  }, []);

  const hasMyStopped = useMemo(
    () => !!nickname && spinHistory.some((item) => item.nickname === nickname),
    [nickname, spinHistory],
  );

  const fetchRankings = useCallback(
    async (silent = false) => {
      if (!battleId) return;
      try {
        const data = await menuBattleAPI.getRankings(battleId);
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray((data as { rankings?: Ranking[] })?.rankings)
            ? ((data as { rankings: Ranking[] }).rankings ?? [])
            : [];
        setRankings(normalized);
      } catch {
        if (!silent) openToast("순위를 불러오지 못했습니다.");
      }
    },
    [battleId, openToast],
  );

  const syncBattle = useCallback(
    async (silent = false) => {
      if (!battleId) return;
      try {
        const data = (await menuBattleAPI.getBattle(
          battleId,
        )) as BattleResponse;
        updateFromBattle(data);

        if (nickname) {
          setIsCreator(data.creatorNickname === nickname);
          try {
            const creatorInfo = await menuBattleAPI.isCreator(
              battleId,
              nickname,
            );
            setIsCreator(creatorInfo.isCreator);
          } catch {
            // keep fallback
          }
        } else {
          setIsCreator(false);
        }

        await fetchRankings(silent);
      } catch {
        if (!silent) openToast("배틀방 정보를 불러오지 못했습니다.");
      }
    },
    [battleId, nickname, fetchRankings, openToast, updateFromBattle],
  );

  useEffect(() => {
    void syncBattle();
  }, [syncBattle]);

  useEffect(() => {
    if (!battleId || finished) return;
    const timer = window.setInterval(() => void syncBattle(true), 2000);
    return () => window.clearInterval(timer);
  }, [battleId, finished, syncBattle]);

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
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    if (
      showNicknameModal ||
      finished ||
      hasMyStopped ||
      isSubmittingSpin ||
      menus.length === 0
    )
      return;
    if (isSpinning) return;
    rouletteRef.current?.start();
    setIsSpinning(true);
  }, [
    finished,
    hasMyStopped,
    isSpinning,
    isSubmittingSpin,
    menus.length,
    showNicknameModal,
  ]);

  const isValidNickname = (value: string) =>
    /^[a-zA-Z0-9가-힣]{1,20}$/.test(value);

  const handleConfirmNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !isValidNickname(trimmed)) {
      openToast("닉네임은 영문/숫자/한글 1~20자로 입력해주세요.");
      return;
    }
    if (!battleId) return;

    try {
      setIsSubmittingNickname(true);
      const joinResult = await menuBattleAPI.joinBattle(battleId, trimmed);
      setNickname(trimmed);
      if (typeof joinResult?.isCreator === "boolean") {
        setIsCreator(joinResult.isCreator);
      }
      setShowNicknameModal(false);

      window.history.replaceState(
        null,
        "",
        `/menu-battle/play/${battleId}?nickname=${encodeURIComponent(trimmed)}&battleName=${encodeURIComponent(battleName)}`,
      );

      await syncBattle();
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
          setIsCreator(battle.creatorNickname === trimmed);
          setShowNicknameModal(false);

          window.history.replaceState(
            null,
            "",
            `/menu-battle/play/${battleId}?nickname=${encodeURIComponent(trimmed)}&battleName=${encodeURIComponent(battleName)}`,
          );

          await syncBattle();
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

    if (!isSpinning) {
      rouletteRef.current?.start();
      setIsSpinning(true);
      return;
    }

    // Stop immediately on click, then reconcile with server result.
    rouletteRef.current?.stop();
    setIsSpinning(false);

    try {
      setIsSubmittingSpin(true);
      const result = await menuBattleAPI.spin(battleId, nickname);
      await rouletteRef.current?.animateToAngle(result.stoppedAngle);
      setSpinHistory((prev) =>
        mergeSpinResults(prev, [
          {
            nickname: result.nickname,
            stoppedAngle: result.stoppedAngle,
            closestMenuName: result.closestMenuName,
            distanceToBoundary: result.distanceToBoundary,
            rank: result.rank,
            spunAt: result.spunAt,
          },
        ]),
      );
      await syncBattle();
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
      const result = await menuBattleAPI.finish(battleId, nickname);
      if (result && typeof result === "object" && "winner" in result) {
        const winnerFromResult = (result as { winner?: Winner }).winner;
        if (winnerFromResult) {
          setWinner(winnerFromResult);
        }
      }
      setFinished(true);
      await syncBattle(true);
      await fetchRankings(true);
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
