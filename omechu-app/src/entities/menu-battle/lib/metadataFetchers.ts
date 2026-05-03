// OG metadata 생성용 우승자 fetcher.
// battle_public_winner RPC를 anon 권한으로 호출 — finished/active 무관하게 현재 1위 정보 반환.
import { createClient } from "@supabase/supabase-js";

export type BattleWinnerMenu = {
  menuName: string;
  imageLink: string | null;
};

export async function fetchBattleWinnerForMetadata(
  battleId: string,
): Promise<BattleWinnerMenu | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.rpc("battle_public_winner", {
      p_battle_id: battleId,
    });
    if (error) return null;

    const row = (Array.isArray(data) ? data[0] : data) as
      | { winner_menu_name: string | null; winner_menu_image: string | null }
      | undefined;
    if (!row?.winner_menu_name) return null;

    return {
      menuName: row.winner_menu_name,
      imageLink: row.winner_menu_image ?? null,
    };
  } catch {
    return null;
  }
}
