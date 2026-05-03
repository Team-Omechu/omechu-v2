// 배틀 API는 Supabase `menu_battle` + Realtime + RPC로 이전 대기 중.
// 그 전까지 모든 호출은 명시적으로 실패시켜 UI가 에러 토스트를 띄우도록 한다.
// UI가 기대하는 반환 shape을 유지하기 위해 stub은 타입만 보존한다.

const NOT_IMPLEMENTED = "배틀 서비스는 점검 중입니다.";

function stub(): never {
  throw new Error(NOT_IMPLEMENTED);
}

export const menuBattleAPI = {
  createBattle: async (_payload: {
    menuIds: number[];
  }): Promise<{
    battleId: string;
    creatorNickname: string | null;
  }> => stub(),

  getBattle: async (_battleId: string): Promise<unknown> => stub(),

  isCreator: async (
    _battleId: string,
    _nickname: string,
  ): Promise<{
    battleId: string;
    nickname: string;
    isCreator: boolean;
    creatorNickname: string;
  }> => stub(),

  joinBattle: async (
    _battleId: string,
    _nickname: string,
  ): Promise<{
    isCreator?: boolean;
    battleId?: string;
    nickname?: string;
  }> => stub(),

  spin: async (
    _battleId: string,
    _nickname: string,
  ): Promise<{
    resultId: string;
    nickname: string;
    stoppedAngle: number;
    closestMenuName: string;
    distanceToBoundary: number;
    rank: number;
    spunAt: string;
  }> => stub(),

  finish: async (
    _battleId: string,
    _nickname: string,
  ): Promise<{
    battleId: string;
    status: "finished";
    finishedAt: string;
    winner: {
      nickname: string;
      closestMenuName: string;
      distanceToBoundary: number;
      rank: number;
    };
  }> => stub(),

  getRankings: async (
    _battleId: string,
  ): Promise<
    {
      rank: number;
      nickname: string;
      closestMenuName: string;
      distanceToBoundary: number;
    }[]
  > => stub(),

  leaveBattle: async (_battleId: string, _nickname: string): Promise<void> =>
    stub(),
};
