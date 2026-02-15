"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  BaseModal,
  Header,
  IngredientCard,
  ModalWrapper,
  RestaurantCard,
  SkeletonUIFoodBox,
  Toast,
  type MenuDetail,
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

  // ✅ 홈 버튼 모달
  const [showHomeModal, setShowHomeModal] = useState(false);

  // ✅ 토스트(공유/기록) 통합
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const openToast = (msg: string, ms = 2000) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setShowToast(false), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ✅ 페이지네이션 상태 + 누적 리스트
  const [page, setPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isEnd, setIsEnd] = useState(false);

  const { data, isLoading, isFetching } = useGetRestaurants(page);

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
        openToast("먹부림 기록에 등록되었습니다.", 2000);
        sessionStorage.setItem(key, "done");
      },
      onError: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodeMenuId, shouldRecord]);

  useEffect(() => {
    if (!data) return;

    const items = data.items ?? [];

    if (page > 1 && items.length === 0) {
      setIsEnd(true);
      return;
    }

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
    if (isEnd || isFetching) return;
    setPage((p) => p + 1);
  };

  // ✅ 공유 로직 (Web Share -> Clipboard fallback)
  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (!url) return;

      const nav = typeof window !== "undefined" ? window.navigator : null;

      if (
        nav &&
        typeof (nav as Navigator & { share?: unknown }).share === "function"
      ) {
        await (
          nav as Navigator & {
            share: (data: {
              title?: string;
              text?: string;
              url?: string;
            }) => Promise<void>;
          }
        ).share({
          title: detailMenu?.name ? `${detailMenu.name} 추천!` : "오늘의 메뉴",
          text: detailMenu?.name
            ? `오늘은 ${detailMenu.name} 어때?`
            : "오늘의 메뉴 확인해봐!",
          url,
        });
        return;
      }

      if (
        nav &&
        nav.clipboard &&
        typeof nav.clipboard.writeText === "function"
      ) {
        await nav.clipboard.writeText(url);
        openToast("링크가 복사됐어요.", 2000);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      openToast("링크가 복사됐어요.", 2000);
    } catch {
      alert("공유에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="flex w-full flex-col">
      <Header
        title="오늘의 메뉴"
        showHomeButton={true}
        showShareButton={true}
        onShareClick={handleShare}
        onHomeClick={() => setShowHomeModal(true)}
      />

      <div className="mt-4 flex-col items-center justify-center p-4">
        <p className="text-brand-primary mb-3 text-center text-[1.5rem] font-semibold">
          {detailMenu?.name}
        </p>
        <Image
          src={"/image/image_empty.svg"}
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

      <div className="mt-3 ml-4 items-center justify-center space-y-3.5 px-4">
        <h3 className="text-font-high text-body-3-medium text-[1.125rem] font-semibold whitespace-nowrap">
          취향 저격! 추천 메뉴 있는 맛집
        </h3>
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

      {showHomeModal && (
        <ModalWrapper>
          <BaseModal
            title="메뉴추천을 중단하시겠어요?"
            leftButtonText="그만하기"
            rightButtonText="계속하기"
            onCloseClick={() => setShowHomeModal(false)}
            onLeftButtonClick={() => {
              setShowHomeModal(false);
              router.push("/mainpage");
            }}
            onRightButtonClick={() => setShowHomeModal(false)}
          />
        </ModalWrapper>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      />
    </div>
  );
}
