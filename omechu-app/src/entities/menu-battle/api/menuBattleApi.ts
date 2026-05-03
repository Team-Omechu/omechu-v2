// 메뉴 배틀 API. Supabase Postgres + Realtime 기반.
// - 모든 mutation은 supabase.rpc('battle_*') 경유 (security definer로 권한 검증).
// - getBattle은 PostgREST embedded resource 한 번 + battle_rankings RPC.
// - rank는 spin_results에 저장하지 않고 read 시 distance_to_boundary 오름차순으로 계산.
import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

import type { BattleResponse } from "../model/api";

type BattleRow = {
  battle_id: string;
  creator_nickname: string | null;
  status: "waiting" | "active" | "finished";
  title: string;
  created_at: string;
  finished_at: string | null;
  expires_at: string;
  battle_menus: {
    menu_id: number;
    menu_name: string;
    boundary_angle: number | string;
    menu_order: number;
    menu: { image_link: string | null } | null;
  }[];
  battle_participants: {
    nickname: string;
    is_creator: boolean;
    joined_at: string;
  }[];
  spin_results: {
    nickname: string;
    stopped_angle: number | string;
    closest_menu_name: string;
    distance_to_boundary: number | string;
    spun_at: string;
  }[];
};

const SELECT_BATTLE = `
  battle_id,
  creator_nickname,
  status,
  title,
  created_at,
  finished_at,
  expires_at,
  battle_menus(menu_id, menu_name, boundary_angle, menu_order, menu(image_link)),
  battle_participants(nickname, is_creator, joined_at),
  spin_results(nickname, stopped_angle, closest_menu_name, distance_to_boundary, spun_at)
`;

function num(v: number | string): number {
  return typeof v === "string" ? Number(v) : v;
}

function mapBattle(row: BattleRow): BattleResponse {
  const sortedSpins = [...row.spin_results].sort((a, b) => {
    const da = num(a.distance_to_boundary);
    const db = num(b.distance_to_boundary);
    if (da !== db) return da - db;
    return a.spun_at.localeCompare(b.spun_at);
  });

  return {
    battleId: row.battle_id,
    creatorNickname: row.creator_nickname ?? "",
    status: row.status === "finished" ? "finished" : "active",
    participantCount: row.battle_participants.length,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
    expiresAt: row.expires_at,
    menus: [...row.battle_menus]
      .sort((a, b) => a.menu_order - b.menu_order)
      .map((m) => ({
        menuId: String(m.menu_id),
        menuName: m.menu_name,
        boundaryAngle: num(m.boundary_angle),
        menuOrder: m.menu_order,
        imageLink: m.menu?.image_link ?? null,
      })),
    participants: row.battle_participants.map((p) => ({
      nickname: p.nickname,
      isCreator: p.is_creator,
      joinedAt: p.joined_at,
    })),
    spinResults: sortedSpins.map((s, idx) => ({
      nickname: s.nickname,
      stoppedAngle: num(s.stopped_angle),
      closestMenuName: s.closest_menu_name,
      distanceToBoundary: num(s.distance_to_boundary),
      rank: idx + 1,
      spunAt: s.spun_at,
    })),
  };
}

function rpcError(error: { message?: string; code?: string } | null): Error {
  if (!error) return new Error("알 수 없는 오류가 발생했습니다.");
  switch (error.message) {
    case "unauthorized":
      return new Error("세션이 만료되었습니다. 새로고침 해주세요.");
    case "menu_count_invalid":
      return new Error("메뉴는 2개에서 8개 사이로 선택해야 합니다.");
    case "code_pool_busy":
      return new Error("배틀방 코드가 부족합니다. 잠시 후 다시 시도해주세요.");
    case "battle_not_found":
      return new Error("존재하지 않는 배틀방입니다.");
    case "battle_expired":
      return new Error("만료된 배틀방입니다.");
    case "battle_finished":
      return new Error("이미 종료된 배틀방입니다.");
    case "nickname_invalid":
      return new Error("닉네임은 영문/숫자/한글 1~20자로 입력해주세요.");
    case "nickname_taken":
      return new Error("이미 사용 중인 닉네임입니다.");
    case "already_joined_as_other":
      return new Error("이미 다른 닉네임으로 입장했습니다.");
    case "not_participant":
      return new Error("배틀 참가자가 아닙니다.");
    case "already_spun":
      return new Error("이미 결과가 결정되었습니다.");
    case "not_creator":
      return new Error("배틀방을 만든 사람만 마감할 수 있습니다.");
    default:
      return new Error(error.message ?? "요청에 실패했습니다.");
  }
}

export const menuBattleAPI = {
  createBattle: async (payload: {
    title: string;
    menuIds: number[];
  }): Promise<{
    battleId: string;
    title: string;
    expiresAt: string;
  }> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb.rpc("battle_create", {
      p_title: payload.title,
      p_menu_ids: payload.menuIds,
    });
    if (error) throw rpcError(error);
    const row = (Array.isArray(data) ? data[0] : data) as
      | { battle_id: string; title: string; expires_at: string }
      | undefined;
    if (!row) throw new Error("배틀방 생성에 실패했습니다.");
    return {
      battleId: row.battle_id,
      title: row.title,
      expiresAt: row.expires_at,
    };
  },

  getBattle: async (battleId: string): Promise<BattleResponse> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("battles")
      .select(SELECT_BATTLE)
      .eq("battle_id", battleId)
      .maybeSingle();
    if (error) throw rpcError(error);
    if (!data) throw new Error("battle_not_found");
    return mapBattle(data as unknown as BattleRow);
  },

  isCreator: async (
    battleId: string,
    nickname: string,
  ): Promise<{
    battleId: string;
    nickname: string;
    isCreator: boolean;
    creatorNickname: string;
  }> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("battles")
      .select("creator_nickname")
      .eq("battle_id", battleId)
      .maybeSingle();
    if (error) throw rpcError(error);
    const creatorNickname = (data?.creator_nickname as string | null) ?? "";
    return {
      battleId,
      nickname,
      isCreator: creatorNickname === nickname,
      creatorNickname,
    };
  },

  joinBattle: async (
    battleId: string,
    nickname: string,
  ): Promise<{
    battleId: string;
    nickname: string;
    isCreator: boolean;
  }> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb.rpc("battle_join", {
      p_battle_id: battleId,
      p_nickname: nickname,
    });
    if (error) throw rpcError(error);
    const row = (Array.isArray(data) ? data[0] : data) as
      | { battle_id: string; nickname: string; is_creator: boolean }
      | undefined;
    if (!row) throw new Error("입장에 실패했습니다.");
    return {
      battleId: row.battle_id,
      nickname: row.nickname,
      isCreator: row.is_creator,
    };
  },

  spin: async (
    battleId: string,
    nickname: string,
  ): Promise<{
    nickname: string;
    stoppedAngle: number;
    closestMenuName: string;
    distanceToBoundary: number;
    rank: number;
    spunAt: string;
  }> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb.rpc("battle_spin", {
      p_battle_id: battleId,
      p_nickname: nickname,
    });
    if (error) throw rpcError(error);
    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          nickname: string;
          stopped_angle: number | string;
          closest_menu_name: string;
          distance_to_boundary: number | string;
          spun_at: string;
        }
      | undefined;
    if (!row) throw new Error("스핀에 실패했습니다.");
    return {
      nickname: row.nickname,
      stoppedAngle: num(row.stopped_angle),
      closestMenuName: row.closest_menu_name,
      distanceToBoundary: num(row.distance_to_boundary),
      rank: 0,
      spunAt: row.spun_at,
    };
  },

  finish: async (
    battleId: string,
    nickname: string,
  ): Promise<{
    battleId: string;
    status: "finished";
    finishedAt: string;
  }> => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb.rpc("battle_finish", {
      p_battle_id: battleId,
      p_nickname: nickname,
    });
    if (error) throw rpcError(error);
    const row = (Array.isArray(data) ? data[0] : data) as
      | { battle_id: string; status: string; finished_at: string }
      | undefined;
    if (!row) throw new Error("배틀 마감에 실패했습니다.");
    return {
      battleId: row.battle_id,
      status: "finished",
      finishedAt: row.finished_at,
    };
  },

  getRankings: async (
    battleId: string,
  ): Promise<
    {
      rank: number;
      nickname: string;
      closestMenuName: string;
      distanceToBoundary: number;
    }[]
  > => {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb.rpc("battle_rankings", {
      p_battle_id: battleId,
    });
    if (error) throw rpcError(error);
    const rows = (data ?? []) as {
      rank: number;
      nickname: string;
      closest_menu_name: string;
      distance_to_boundary: number | string;
    }[];
    return rows.map((r) => ({
      rank: r.rank,
      nickname: r.nickname,
      closestMenuName: r.closest_menu_name,
      distanceToBoundary: num(r.distance_to_boundary),
    }));
  },

  leaveBattle: async (battleId: string, nickname: string): Promise<void> => {
    const sb = createSupabaseBrowserClient();
    const { error } = await sb.rpc("battle_leave", {
      p_battle_id: battleId,
      p_nickname: nickname,
    });
    if (error) throw rpcError(error);
  },
};
