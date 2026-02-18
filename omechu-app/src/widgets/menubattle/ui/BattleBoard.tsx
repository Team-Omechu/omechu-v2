import { Player } from "@/entities/menubattle/model/types";

export function BattleBoard({
  players,
  creatorNickname,
}: {
  players: Player[];
  creatorNickname?: string;
}) {
  return (
    <div className="mt-8">
      <p className="text-font-placeholder text-body-3">
        &lt;참가자 : {players.length}명&gt;
      </p>

      <div className="mt-4 flex justify-center gap-2">
        {players.map((player) => (
          <span
            key={player.id}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              creatorNickname && player.name === creatorNickname
                ? "border-statelayer-default bg-statelayer-default text-white"
                : "border-statelayer-default text-statelayer-default bg-white"
            }`}
          >
            {player.name}
          </span>
        ))}
      </div>
    </div>
  );
}
