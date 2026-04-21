import type { Ranking, Winner } from "./types";

// 배틀이 종료되었는지 여부
export const isBattleFinished = (status?: string) => status === "finished";

// 우승자 존재 여부
export const hasWinner = (
  winner: Winner | null | undefined,
): winner is Winner => !!winner;

// 랭킹 정렬 (안전용: rank 오름차순)
export const sortRankings = (rankings: Ranking[]) =>
  [...rankings].sort((a, b) => a.rank - b.rank);
