// TODO(supabase-migration): 배틀 전체 플로우 재설계 필요.
// - `menu_battle`, `battle_participant`, `battle_spin` 테이블 + RLS
// - create/spin/finish은 원자성을 위해 Postgres RPC 함수 (Edge Function도 가능)
// - 참가자 join/leave, spin 결과 broadcast는 Supabase Realtime
// 현재 NEXT_PUBLIC_API_URL(UMC 백엔드) 의존 — 백엔드 서버 부재로 동작하지 않음.
import { fetchJSON } from "./fetchJSON";

export const menuBattleAPI = {
  createBattle: (payload: { menuIds: number[] }) =>
    fetchJSON<{
      battleId: string;
      creatorNickname: string | null;
    }>("/menu/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  getBattle: (battleId: string) => fetchJSON(`/menu/battles/${battleId}`),

  isCreator: (battleId: string, nickname: string) =>
    fetchJSON<{
      battleId: string;
      nickname: string;
      isCreator: boolean;
      creatorNickname: string;
    }>(`/menu/battles/${battleId}/is-creator/${encodeURIComponent(nickname)}`),

  joinBattle: (battleId: string, nickname: string) =>
    fetchJSON<{
      isCreator?: boolean;
      battleId?: string;
      nickname?: string;
    }>(`/menu/battles/${battleId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }),

  spin: (battleId: string, nickname: string) =>
    fetchJSON<{
      resultId: string;
      nickname: string;
      stoppedAngle: number;
      closestMenuName: string;
      distanceToBoundary: number;
      rank: number;
      spunAt: string;
    }>(`/menu/battles/${battleId}/spin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }),

  finish: (battleId: string, nickname: string) =>
    fetchJSON<{
      battleId: string;
      status: "finished";
      finishedAt: string;
      winner: {
        nickname: string;
        closestMenuName: string;
        distanceToBoundary: number;
        rank: number;
      };
    }>(`/menu/battles/${battleId}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }),

  getRankings: (battleId: string) =>
    fetchJSON<
      {
        rank: number;
        nickname: string;
        closestMenuName: string;
        distanceToBoundary: number;
      }[]
    >(`/menu/battles/${battleId}/rankings`),

  leaveBattle: (battleId: string, nickname: string) =>
    fetchJSON<void>(
      `/menu/battles/${battleId}/participants/${encodeURIComponent(nickname)}`,
      {
        method: "DELETE",
      },
    ),
};
