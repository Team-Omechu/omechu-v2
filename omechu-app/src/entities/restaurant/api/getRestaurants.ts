import type {
  Restaurant,
  RestaurantListResponse,
  RestaurantRequest,
} from "@/entities/restaurant/config/restaurantData";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

// Places API v1 응답에서 우리 앱 도메인 타입으로 매핑.
// Edge function `google-places` (action: text) 호출 결과를 RestaurantListResponse로 변환한다.
// TODO(pagination): Places v1 text search는 nextPageToken 기반. 현재는 1페이지만 반환하고
// 추가 페이지는 빈 결과로 종료 처리한다. 필요 시 pageToken 상태를 별도로 관리해야 함.

interface PlacesV1Response {
  places?: Array<{
    id: string;
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    priceLevel?: string;
    displayName?: { text: string; languageCode: string };
    types?: string[];
    photos?: Array<{
      name: string;
      widthPx: number;
      heightPx: number;
      authorAttributions?: Array<{
        displayName: string;
        uri: string;
        photoUri: string;
      }>;
    }>;
    rating?: number;
    userRatingCount?: number;
  }>;
  nextPageToken?: string;
}

type EdgeEnvelope<T> =
  | T
  | {
      resultType: "SUCCESS" | "FAIL";
      success: T | null;
      error: { errorCode: string; reason: string } | null;
    };

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const getRestaurants = async (
  request: RestaurantRequest,
): Promise<RestaurantListResponse> => {
  const { latitude, longitude, radius, keyword, page } = request;

  // 첫 페이지 외에는 빈 결과로 종료 (TODO: pageToken 기반 페이지네이션)
  if (page > 1) {
    return { page, pageSize: 0, totalCount: 0, totalPages: 1, items: [] };
  }

  const sb = createSupabaseBrowserClient();

  const payload = {
    textQuery: keyword ?? "",
    languageCode: "ko",
    pageSize: 20,
    ...(latitude !== null && longitude !== null && radius !== null
      ? {
          locationBias: {
            circle: {
              center: { latitude, longitude },
              radius,
            },
          },
        }
      : {}),
  };

  const { data, error } = await sb.functions.invoke<
    EdgeEnvelope<PlacesV1Response>
  >("google-places", {
    body: { action: "text", payload },
  });

  if (error) throw error;
  if (!data) throw new Error("places_empty_response");

  // 엣지펑션이 envelope로 감싸 반환할 수도, Google 원본을 그대로 패스스루할 수도 있음
  const raw: PlacesV1Response =
    typeof data === "object" && data !== null && "resultType" in data
      ? ((data.success ?? {}) as PlacesV1Response)
      : (data as PlacesV1Response);

  const places = raw.places ?? [];

  const items: Restaurant[] = places.map((p) => {
    const plat = p.location?.latitude ?? 0;
    const plng = p.location?.longitude ?? 0;
    const distance =
      latitude !== null && longitude !== null
        ? haversineMeters(latitude, longitude, plat, plng)
        : 0;

    const photo = p.photos?.[0];

    return {
      id: p.id,
      formattedAddress: p.formattedAddress ?? "",
      location: { latitude: plat, longitude: plng },
      priceLevel: p.priceLevel ?? "",
      displayName: p.displayName ?? { text: "", languageCode: "ko" },
      primaryType: p.types?.[0] ?? "",
      photo: photo
        ? {
            name: photo.name,
            widthPx: photo.widthPx,
            heightPx: photo.heightPx,
            authorAttributions: photo.authorAttributions ?? [],
            flagContentUri: "",
            googleMapsUri: "",
          }
        : null,
      distance,
      rating: p.rating,
      userRatingCount: p.userRatingCount,
    };
  });

  return {
    page: 1,
    pageSize: items.length,
    totalCount: items.length,
    totalPages: 1,
    items,
  };
};
