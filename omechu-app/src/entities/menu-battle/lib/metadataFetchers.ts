// TODO(supabase-battle-migration): 배틀 도메인 자체가 Supabase로 미이전 상태.
// 현재는 metadata fetcher를 no-op으로 두고, 실제 배틀 테이블 이전 후 재작성.

export type BattleWinnerMenu = {
  menuName: string;
  imageLink: string | null;
};

export async function fetchBattleWinnerForMetadata(
  _battleId: string,
): Promise<BattleWinnerMenu | null> {
  return null;
}
