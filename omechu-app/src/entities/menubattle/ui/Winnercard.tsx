import { useEffect, useState } from "react";

import Image from "next/image";

import { fetchJSON } from "@/shared/api/fetchJSON";

type WinnerCardProps = {
  winner: {
    nickname: string;
    closestMenuName: string;
    distanceToBoundary: number;
  };
};

export function WinnerCard({ winner }: WinnerCardProps) {
  const [menuImage, setMenuImage] = useState<string | null>(null);

  useEffect(() => {
    if (!winner) return;

    fetchJSON<{ name: string; image_link: string }[]>(
      `/menu/search?keyword=${encodeURIComponent(winner.closestMenuName)}`,
    ).then((res) => {
      if (res.length > 0) {
        setMenuImage(res[0].image_link);
      }
    });
  }, [winner]);

  return (
    <div className="rounded-2xl border-2 border-[#FF7A7A] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/menubattle/winner.svg"
            alt="winner"
            width={50}
            height={75}
            priority
          />
          <div>
            <p className="font-semibold">우승자 {winner.nickname}</p>
            <p className="text-sm text-gray-500">
              오늘의 메뉴는 {winner.closestMenuName}!
            </p>
          </div>
        </div>

        <div className="h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
          <Image
            src={menuImage ?? "/sample/sample-pasta.png"}
            alt={winner.closestMenuName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
