"use client";

import Image from "next/image";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { useLocationAnswerStore } from "@/entities/location";
import { type MenuDetail, useGetMenuDetail } from "@/entities/menu";
import { usePostMukburim } from "@/entities/mukburim";
import type { Restaurant } from "@/entities/restaurant";
import {
  buildGooglePlacePhotoUrl,
  useGetRestaurants,
} from "@/entities/restaurant";

import { HttpError } from "@/shared/lib/httpError";

import {
  Header,
  IngredientCard,
  RestaurantCard,
  SkeletonRecommendedFoodCard,
  Toast,
  useShareUrl,
  useToast,
} from "@/shared";

export default function MenuDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { menuId } = useParams();
  const decodeMenuId = decodeURIComponent(menuId as string);

  const { data: menuDetailData } = useGetMenuDetail(decodeMenuId);
  const detailMenu: MenuDetail | undefined = menuDetailData;

  const { mutate } = usePostMukburim();

  // ✅ 토스트(공유/기록) 통합
  const {
    show: showToast,
    message: toastMessage,
    triggerToast,
  } = useToast({ duration: 2000 });

  const openToast = useCallback(
    (msg: string, ms = 2000) => triggerToast(msg, ms),
    [triggerToast],
  );

  const { locationDenied } = useLocationAnswerStore();

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useGetRestaurants();

  // 누적 리스트는 모든 페이지를 ID로 dedupe 해서 파생.
  const restaurants = useMemo<Restaurant[]>(() => {
    const all = data?.pages.flatMap((p) => p.items ?? []) ?? [];
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [data]);

  const isEnd = !hasNextPage;

  const isRestaurant404 = error instanceof HttpError && error.status === 404;

  // 위치 허용 여부
  const showRestaurantLoadFail = locationDenied || isRestaurant404;

  const shouldRecord = searchParams.get("record") === "1";

  // URL에서 record 파라미터 제거
  const cleanQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (next.has("record")) {
      next.delete("record");
      router.replace(next.size ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }
  }, [router, searchParams, pathname]);

  useEffect(() => {
    if (!decodeMenuId || !shouldRecord) return;

    mutate(decodeMenuId, {
      onSuccess: () => {
        openToast("먹부림 기록에 등록되었습니다.", 2000);
      },
      onError: (err) => {
        openToast("먹부림 기록 등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
        console.warn("[MenuDetail] Mukburim record failed:", err);
      },
      onSettled: () => {
        cleanQuery();
      },
    });
  }, [decodeMenuId, shouldRecord, mutate, openToast, cleanQuery]);

  const handleLoadMore = () => {
    if (!hasNextPage || isFetching || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const { share } = useShareUrl({
    onCopied: () => openToast("링크가 복사됐어요.", 2000),
    onFailed: () => alert("공유에 실패했어요. 다시 시도해 주세요."),
  });

  const handleShare = () =>
    share({
      title: detailMenu?.name ? `${detailMenu.name} 추천!` : "오늘의 메뉴",
      text: detailMenu?.name
        ? `오늘은 ${detailMenu.name} 어때?`
        : "오늘의 메뉴 확인해봐!",
    });

  return (
    <div className="flex w-full flex-col items-center">
      <Header
        title="오늘의 메뉴"
        showBackButton={false}
        showShareButton={true}
        onShareClick={handleShare}
        showHomeButton={true}
        onHomeClick={() => router.push("/mainpage")}
      />

      <div className="mt-4 flex-col items-center justify-center p-4">
        <p className="text-brand-primary text-body-1 mb-3 text-center font-semibold">
          {detailMenu?.name}
        </p>
        <Image
          src={detailMenu?.image_link || "/image/image_empty.svg"}
          alt={detailMenu?.name || "메뉴 이미지"}
          className="mx-auto h-32 w-32 rounded-md"
          width={96}
          height={96}
        />
      </div>

      <div className="w-fit p-4">
        <IngredientCard
          kcal={detailMenu?.calory}
          carbohydrate={detailMenu?.carbo}
          protein={detailMenu?.protein}
          fat={detailMenu?.fat}
          vitamin={detailMenu?.vitamin}
          allergies={detailMenu?.allergic}
        />
      </div>

      <div className="mt-3 w-fit items-center justify-center space-y-3.5 px-4 pb-6">
        <h3 className="text-font-high text-body-3-medium text-body-3 whitespace-nowrap">
          취향 저격! 추천 메뉴 있는 맛집
        </h3>
        {/* 404 or 위치 차단 */}
        {showRestaurantLoadFail ? (
          <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white/60 px-4 py-10">
            <p className="text-[0.95rem] font-semibold text-neutral-800">
              맛집 정보를 불러올 수 없습니다.
            </p>
            {locationDenied ? (
              <p className="text-caption-1 mt-2 text-center text-neutral-600">
                위치 권한이 꺼져 있어요. 브라우저/기기 설정에서 위치 권한을
                허용해 주세요.
              </p>
            ) : (
              <p className="text-caption-1 mt-2 text-center text-neutral-600">
                해당 위치 또는 키워드 조건에 맞는 맛집이 없어요.
              </p>
            )}
          </div>
        ) : (
          <>
            {(isLoading || (isFetching && restaurants.length === 0)) && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRecommendedFoodCard key={i} />
                ))}
              </div>
            )}

            {restaurants.map((item) => {
              const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

              const imageSrc =
                apiKey && item.photo?.name
                  ? buildGooglePlacePhotoUrl({
                      photoName: item.photo.name,
                      apiKey,
                      maxWidthPx: 360,
                      maxHeightPx: 360,
                    })
                  : "/image/image_empty.svg";

              return (
                <RestaurantCard
                  key={item.id}
                  name={item.displayName.text}
                  category={detailMenu?.name || ""}
                  distance={`${Math.round(item.distance / 10) / 100}K`}
                  address={item.formattedAddress}
                  price={item.priceLevel}
                  image={imageSrc}
                />
              );
            })}

            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isEnd || isFetching}
              className="text-font-placeholder mr-2 mb-5 w-full text-center disabled:opacity-50"
            >
              {isFetching
                ? "불러오는 중..."
                : isEnd
                  ? "마지막입니다"
                  : "더보기"}
            </button>
          </>
        )}
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      />
    </div>
  );
}
