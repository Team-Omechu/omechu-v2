import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { handleLocation, useLocationAnswerStore } from "@/entities/location";
import { fetchJSON } from "@/shared/api/fetchJSON";

type WinnerCardProps = {
  winner: {
    nickname: string;
    closestMenuName: string;
    distanceToBoundary: number;
  };
};

export function WinnerCard({ winner }: WinnerCardProps) {
  const router = useRouter();
  const { setKeyword, setX, setY, setLocationDenied } =
    useLocationAnswerStore();
  const [menuImage, setMenuImage] = useState<string | null>(null);

  useEffect(() => {
    void fetchJSON<{ name: string; image_link: string }[]>(
      `/menu/search?keyword=${encodeURIComponent(winner.closestMenuName)}`,
    ).then((response) => {
      if (response.length > 0) {
        setMenuImage(response[0].image_link);
      }
    });
  }, [winner.closestMenuName]);

  return (
    <button
      type="button"
      onClick={() => {
        setKeyword(winner.closestMenuName);
        handleLocation(setX, setY, setLocationDenied);
        router.push(
          `/mainpage/result/${encodeURIComponent(winner.closestMenuName)}`,
        );
      }}
      className="w-full rounded-2xl border-2 border-[#FF7A7A] bg-white px-4 py-3 text-left"
      aria-label={`${winner.closestMenuName} 메뉴 추천 결과 보기`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/menubattle/winner.svg"
            alt="winner"
            width={42}
            height={42}
            priority
          />
          <div className="text-left">
            <p className="text-body-3-medium text-font-high">
              우승자 {winner.nickname}
            </p>
            <p className="text-body-4 text-font-placeholder">
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
    </button>
  );
}
