/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";

import io, { Socket } from "socket.io-client";

import {
  Player,
  PlayerResult,
  BattleResponse,
  SpinCompletedPayload,
  Menu,
} from "@/entities/menubattle";
import { ResultPanel } from "@/entities/menubattle";
import { fetchJSON } from "@/shared/api/fetchJSON";
import { Header } from "@/shared/ui/header/Header";
import { BattleBoard } from "@/widgets/menubattle";
import { Roulette, RouletteHandle } from "@/widgets/menubattle/ui/Roulette";

export default function PlayPage() {
  const WS_URL = process.env.NEXT_PUBLIC_API_URL!;
  const { id: battleId } = useParams<{ id: string }>();
  const nickname = useSearchParams().get("nickname")!;

  const [menus, setMenus] = useState<Menu[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const rouletteRef = useRef<RouletteHandle | null>(null);

  const BAR_COLORS = ["#FF9029", "#00A3FF", "#5AD886", "#FDDC3F", "#C48CFD"];

  /* 초기 데이터 */
  useEffect(() => {
    if (!battleId) return;

    fetchJSON<BattleResponse>(`/menu/battles/${battleId}`).then((data) => {
      setMenus(
        data.menus.map((m, index) => ({
          menuId: m.menuId,
          menuName: m.menuName,
          centerAngle: m.boundaryAngle,
          color: BAR_COLORS[index % BAR_COLORS.length],
        })),
      );

      setPlayers(
        data.participants.map((p) => ({
          id: p.nickname,
          name: p.nickname,
          joinedAt: new Date(p.joinedAt).getTime(),
        })),
      );

      setResults(
        data.spinResults.map((r) => ({
          playerId: r.nickname,
          name: r.nickname,
          menu: r.closestMenuName,
          diff: r.distanceToBoundary,
          stoppedAt: new Date(r.spunAt).getTime(),
        })),
      );

      if (data.status === "finished") setFinished(true);
    });
  }, [battleId, WS_URL, BAR_COLORS]);

  /* WebSocket */
  useEffect(() => {
    if (!battleId || !nickname) return;

    const socket = io(WS_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("battle:join", { battleId, nickname });

    socket.on("spin:completed", (data: SpinCompletedPayload) => {
      setResults((prev) => [
        ...prev,
        {
          playerId: data.nickname,
          name: data.nickname,
          menu: data.closestMenuName,
          diff: data.distanceToBoundary,
          stoppedAt: new Date(data.spunAt).getTime(),
        },
      ]);
    });

    socket.on("battle:finished", () => setFinished(true));

    return () => {
      socket.disconnect();
    };
  }, [battleId, nickname, WS_URL]);

  /* STOP 처리 (핵심) */
  const handleStop = () => {
    if (!socketRef.current || !rouletteRef.current || finished) return;

    const userAngle = rouletteRef.current.getAngle();

    rouletteRef.current.stop();

    socketRef.current.emit("battle:spin", {
      battleId,
      nickname,
      userAngle,
    });
  };

  const isHost = players[0]?.name === nickname;

  return (
    <main className="min-h-screen bg-[#F7D8FF] px-4 text-center">
      <Header
        title="오늘의 메뉴 배틀"
        showProfileButton
        showHomeButton={false}
      />

      <BattleBoard players={players} />

      {/* 안내 문구 */}
      <div className="py-10">
        <p className="text-font-high text-lg font-semibold">
          원하는 메뉴존의
          <br />
          타이밍에 맞춰 멈추세요!
        </p>
      </div>

      <Roulette ref={rouletteRef} menus={menus} disabled={finished} />

      <button
        onClick={() => {
          if (!hasSpun) {
            rouletteRef.current?.start();
            setHasSpun(true);
          } else {
            handleStop();
            setHasSpun(false);
          }
        }}
        disabled={finished}
        className="mt-4 w-40 rounded-xl bg-[#FF7A9E] py-3 font-semibold text-white disabled:opacity-40"
      >
        {hasSpun ? "STOP" : "SPIN"}
      </button>

      {isHost && !finished && (
        <button
          onClick={() =>
            socketRef.current?.emit("battle:finish", { battleId, nickname })
          }
          className="mt-6 rounded-xl bg-[#FF7A9E] px-8 py-3 text-white"
        >
          배틀 마감하기
        </button>
      )}

      {finished && <ResultPanel results={results} />}
    </main>
  );
}
