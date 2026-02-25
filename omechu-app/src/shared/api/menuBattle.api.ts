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
