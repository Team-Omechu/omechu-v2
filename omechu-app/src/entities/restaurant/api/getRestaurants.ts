import type {
  RestaurantListResponse,
  RestaurantRequest,
} from "@/entities/restaurant/config/restaurantData";

import { axiosInstance } from "@/shared";

export const getRestaurants = async (
  request: RestaurantRequest,
): Promise<RestaurantListResponse> => {
  const { data } = await axiosInstance.post<RestaurantListResponse>(
    "/menu/fetch-google-places",
    request,
  );

  return data;
};
