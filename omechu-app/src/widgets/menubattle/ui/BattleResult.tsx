import { useEffect, useState } from "react";

import {
  Ranking,
  RankingList,
  Winner,
  WinnerCard,
} from "@/entities/menubattle";
import { fetchJSON } from "@/shared/api/fetchJSON";

type BattleResultProps = {
  battleId: string;
  finished: boolean;
  isHost: boolean;
  nickname: string;
  debug?: boolean;
};

export function BattleResult({
  battleId,
  finished,
  isHost,
  nickname,
}: BattleResultProps) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [winner, setWinner] = useState<Ranking | null>(null);

  useEffect(() => {
    if (!finished || !isHost) return;

    fetchJSON<{
      success: {
        winner: Winner;
      };
    }>(`/menu/battles/${battleId}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }).then((res) => {
      setWinner(res.success.winner);
    });
  }, [finished, isHost, battleId, nickname]);

  useEffect(() => {
    if (!finished) return;

    fetchJSON<Ranking[]>(`/menu/battles/${battleId}/rankings`).then(
      setRankings,
    );
  }, [finished, battleId]);

  return (
    <section className="my-14 space-y-4.5">
      {winner && <WinnerCard winner={winner} />}
      {Array.isArray(rankings) && <RankingList rankings={rankings} />}
    </section>
  );
}
