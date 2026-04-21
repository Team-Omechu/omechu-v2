import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { getRestaurants } from "@/entities/restaurant/api/getRestaurants";
import type {
  RestaurantListResponse,
  RestaurantRequest,
} from "@/entities/restaurant/config/restaurantData";

import { useLocationAnswerStore } from "@/shared/store/locationAnswer.store";

const RESTAURANT_STALE_TIME_MS = 5 * 60 * 1000;

export function useGetRestaurants(): UseInfiniteQueryResult<
  { pages: RestaurantListResponse[]; pageParams: number[] },
  Error
> {
  const { x, y, radius, keyword } = useLocationAnswerStore();

  return useInfiniteQuery<
    RestaurantListResponse,
    Error,
    { pages: RestaurantListResponse[]; pageParams: number[] },
    readonly [string, Omit<RestaurantRequest, "page">],
    number
  >({
    queryKey: [
      "Restaurants",
      { latitude: x, longitude: y, radius, keyword },
    ] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getRestaurants({
        latitude: x,
        longitude: y,
        radius,
        keyword,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const items = lastPage?.items ?? [];
      if (items.length === 0) return undefined;
      return lastPageParam + 1;
    },
    staleTime: RESTAURANT_STALE_TIME_MS,
    enabled: x !== 0 && y !== 0 && !!keyword,
  });
}
