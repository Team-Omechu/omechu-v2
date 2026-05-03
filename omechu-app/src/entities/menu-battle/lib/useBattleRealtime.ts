"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

// 배틀 한 건의 모든 변경(참가/스핀/마감)을 단일 채널로 구독한다.
// 이벤트 → 관련 react-query 캐시 invalidate. 폴링 제거 후 푸시 기반 업데이트.
export function useBattleRealtime(battleId: string | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!battleId) return;

    const sb = createSupabaseBrowserClient();
    const filter = `battle_id=eq.${battleId}`;

    const invalidateBattle = () =>
      queryClient.invalidateQueries({ queryKey: ["battle", battleId] });
    const invalidateRankings = () =>
      queryClient.invalidateQueries({
        queryKey: ["battle", battleId, "rankings"],
      });

    const channel = sb
      .channel(`battle:${battleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_participants",
          filter,
        },
        () => {
          invalidateBattle();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "spin_results",
          filter,
        },
        () => {
          invalidateBattle();
          invalidateRankings();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "battles",
          filter,
        },
        () => {
          invalidateBattle();
          invalidateRankings();
        },
      )
      .subscribe();

    return () => {
      void sb.removeChannel(channel);
    };
  }, [battleId, queryClient]);
}
