import {
  Ranking,
  RankingList,
  Winner,
  WinnerCard,
} from "@/entities/menubattle";

type BattleResultProps = {
  winner: Winner | null;
  rankings: Ranking[];
};

export function BattleResult({ winner, rankings }: BattleResultProps) {
  return (
    <section className="my-14 space-y-4.5">
      {winner && <WinnerCard winner={winner} />}
      {Array.isArray(rankings) && <RankingList rankings={rankings} />}
    </section>
  );
}
