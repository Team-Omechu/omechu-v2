import {
  useQuery,
  keepPreviousData,
  type UseQueryResult,
} from "@tanstack/react-query";

import { useLocationAnswerStore } from "@/shared/store/locationAnswer.store";
import { getRestaurants } from "@/entities/restaurant/api/getRestaurants";
import type {
  RestaurantListResponse,
  RestaurantRequest,
} from "@/entities/restaurant/config/RestaurantData";

export function useGetRestaurants(
  page: number,
): UseQueryResult<RestaurantListResponse, Error> {
  const { x, y, radius, keyword } = useLocationAnswerStore();

  const payload: RestaurantRequest = {
    latitude: x,
    longitude: y,
    radius,
    keyword,
    page,
  };

  return useQuery<RestaurantListResponse, Error>({
    queryKey: ["Restaurants", payload] as const,
    queryFn: () => getRestaurants(payload),
    staleTime: 1000 * 60 * 5,
    enabled: x !== 0 && y !== 0 && !!keyword,
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
