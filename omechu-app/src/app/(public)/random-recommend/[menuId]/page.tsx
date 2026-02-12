"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";

import { useGetMenuDetail } from "@/entities/menu";
import { usePostMukburim } from "@/entities/mukburim";
import type { Restaurant } from "@/entities/restaurant";
import { useGetRestaurants } from "@/entities/restaurant";
import {
  Header,
  IngredientCard,
  RestaurantCard,
  SkeletonUIFoodBox,
  Toast,
  type MenuDetail,
} from "@/shared";

export default function MenuDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showToast, setShowToast] = useState(false);

  // ✅ 페이지네이션 상태 + 누적 리스트
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // ✅ 마지막 페이지(더 이상 데이터 없음) 여부
  const [isEnd, setIsEnd] = useState(false);

  const { data, isLoading, isFetching } = useGetRestaurants(page);

  const { menuId } = useParams();
  const { mutate } = usePostMukburim();

  const decodeMenuId = decodeURIComponent(menuId as string);
  const { data: menuDetailData } = useGetMenuDetail(decodeMenuId);
  const detailMenu: MenuDetail | undefined = menuDetailData;

  const shouldRecord = searchParams.get("record") === "1";

  // URL에서 record 파라미터 제거
  const cleanQuery = () => {
    const next = new URLSearchParams(searchParams.toString());
    if (next.has("record")) {
      next.delete("record");
      router.replace(next.size ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }
  };

  useEffect(() => {
    if (!decodeMenuId || !shouldRecord) return;

    const key = `mukburim-recorded:${decodeMenuId}`;
    const already = sessionStorage.getItem(key);

    if (already) {
      cleanQuery();
      return;
    }

    cleanQuery();

    mutate(decodeMenuId, {
      onSuccess: () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        sessionStorage.setItem(key, "done");
      },
      onError: () => {
        console.log(decodeMenuId);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodeMenuId, shouldRecord]);

  // ✅ page 바뀔 때마다 data.items 누적 + "데이터 없음이면 마지막 처리"
  useEffect(() => {
    // 아직 응답이 없으면 아무것도 안 함
    if (!data) return;

    const items = data.items ?? [];

    // ✅ 2페이지 이상 요청했는데 items가 비어있다 => 더 이상 없음
    if (page > 1 && items.length === 0) {
      setIsEnd(true);
      return;
    }

    // ✅ items가 있으면 누적 append (중복 제거)
    if (items.length > 0) {
      setRestaurants((prev) => {
        const prevIds = new Set(prev.map((r) => r.id));
        const merged = [...prev];

        for (const item of items) {
          if (!prevIds.has(item.id)) merged.push(item);
        }
        return merged;
      });
    }
  }, [data, page]);

  const handleLoadMore = () => {
    // ✅ 마지막이면 더보기 막기
    if (isEnd || isFetching) return;

    // ✅ 다음 페이지 요청
    setPage((p) => p + 1);
  };

  return (
    <div className="flex w-full flex-col">
      <Header
        title="오늘의 메뉴"
        showHomeButton={true}
        showShareButton={true}
      />

      <div className="mt-4 flex-col items-center justify-center p-4">
        <p className="text-brand-primary mb-3 text-center text-[1.5rem] font-semibold">
          {detailMenu?.name}
        </p>
        <Image
          src={detailMenu?.image_link || "/image/image_empty.svg"}
          alt={detailMenu?.name || "메뉴 이미지"}
          className="mx-auto h-24 w-24 rounded-md"
          width={96}
          height={96}
        />
      </div>

      <div className="mt-10 ml-4 w-full p-4">
        <IngredientCard
          kcal={detailMenu?.calory}
          carbohydrate={detailMenu?.carbo}
          protein={detailMenu?.protein}
          fat={detailMenu?.fat}
          vitamin={detailMenu?.vitamin}
          allergies={detailMenu?.allergic}
        />
      </div>

      <div className="mt-5 ml-4 flex items-center justify-between">
        <h3 className="text-[1.125rem] font-semibold whitespace-nowrap">
          취향 저격! 추천 메뉴 있는 맛집
        </h3>
        <button
          className="flex items-center justify-center gap-1 px-4"
          onClick={() =>
            router.push(
              `/restaurant?query=${encodeURIComponent(detailMenu?.name || "")}`,
            )
          }
        >
          <Image
            src={"/map/mage_location-fill.svg"}
            alt="현위치"
            width={20}
            height={20}
            className="h-4 w-4"
          />
          <p className="text-sm whitespace-nowrap text-[5E5E5E]">현위치로</p>
        </button>
      </div>

      <div className="mt-3 ml-4 items-center justify-center space-y-3.5 px-4">
        {(isLoading || (isFetching && restaurants.length === 0)) && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonUIFoodBox key={i} />
            ))}
          </div>
        )}

        {restaurants.map((item) => (
          <RestaurantCard
            key={item.id}
            name={item.displayName.text}
            category={detailMenu?.name || ""}
            distance={`${Math.round(item.distance / 10) / 100}K`}
            address={item.formattedAddress}
            price={item.priceLevel}
            onCardClick={() =>
              router.push(`/restaurant/restaurant-detail/${item.id}`)
            }
          />
        ))}

        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isEnd || isFetching}
          className="mr-2 w-full text-center text-[A8A8A8] disabled:opacity-50"
        >
          {isFetching ? "불러오는 중..." : isEnd ? "마지막입니다" : "더보기"}
        </button>
      </div>

      <Toast
        message="먹부림 기록에 등록되었습니다."
        show={showToast}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      />
    </div>
  );
}
