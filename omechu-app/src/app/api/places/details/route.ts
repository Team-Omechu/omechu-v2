import { type NextRequest } from "next/server";

import { errorResponse, jsonResponse } from "@/app/api/_lib/http";
import { withErrorHandler } from "@/app/api/_lib/withErrorHandler";

export const GET = withErrorHandler(async (req) => {
  const nextReq = req as NextRequest;
  const { searchParams } = new URL(nextReq.url);
  const placeId = searchParams.get("placeId");
  const sessiontoken = searchParams.get("sessiontoken") ?? undefined;

  if (!placeId) {
    return errorResponse(
      400,
      "PLACE_ID_REQUIRED",
      "placeId 파라미터가 필요합니다.",
    );
  }

  const key = process.env.GOOGLE_MAP_SERVER_API_KEY;

  if (!key) {
    return errorResponse(
      500,
      "MAP_API_KEY_MISSING",
      "서버 API 키가 설정되지 않았습니다.",
    );
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", String(key));
  url.searchParams.set("language", "ko");
  if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);
  url.searchParams.set(
    "fields",
    [
      "formatted_address",
      "geometry/location",
      "name",
      "address_components",
      "place_id",
    ].join(","),
  );

  const r = await fetch(url.toString());

  if (!r.ok) {
    return errorResponse(
      503,
      "UPSTREAM_UNAVAILABLE",
      "장소 상세 상위 서비스를 일시적으로 사용할 수 없습니다.",
      { upstreamStatus: r.status },
      { "Retry-After": "30" },
    );
  }

  const data = await r.json();

  if (data.status === "OVER_QUERY_LIMIT") {
    return errorResponse(
      429,
      "UPSTREAM_RATE_LIMITED",
      "상위 서비스 요청 한도를 초과했습니다.",
      { upstreamStatus: data.status },
      { "Retry-After": "30" },
    );
  }

  return jsonResponse(data);
});
