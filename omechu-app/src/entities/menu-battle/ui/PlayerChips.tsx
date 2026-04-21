import { type Player } from "../model/types";

export function PlayerChips({ players }: { players: Player[] }) {
  return (
    <div className="flex justify-center gap-2">
      {players.map((p) => (
        <span
          key={p.id}
          className="rounded-full border border-[#FF7A9E] px-3 py-1 text-sm text-[#FF7A9E]"
        >
          {p.name}
        </span>
      ))}
    </div>
  );
}
