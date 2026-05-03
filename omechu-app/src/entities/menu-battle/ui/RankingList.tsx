import Image from "next/image";

import { type Ranking } from "../model/menuBattle.types";

export function RankingList({ rankings }: { rankings: Ranking[] }) {
  return (
    <ul className="space-y-4.5">
      {rankings.map((r) => (
        <li
          key={r.rank}
          className="flex items-center justify-between rounded-xl border bg-white px-5 py-2.5"
        >
          <div className="flex items-center gap-2">
            {r.rank === 1 ? (
              <Image
                src="/menubattle/winner.svg"
                alt="winner"
                width={18}
                height={18}
              />
            ) : (
              <span className="text-body-3 text-font-high w-5">{r.rank}.</span>
            )}

            <span className="text-body-3 text-font-high">
              {r.nickname}({r.closestMenuName})
            </span>
          </div>

          <span className="text-body-3 text-font-high">
            {r.distanceToBoundary}
          </span>
        </li>
      ))}
    </ul>
  );
}
