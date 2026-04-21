import { type NextRequest } from "next/server";

import { errorResponse, jsonResponse } from "@/app/api/_lib/http";
import { withErrorHandler } from "@/app/api/_lib/withErrorHandler";

export const GET = withErrorHandler(async (req) => {
  const nextReq = req as NextRequest;
  const { searchParams } = new URL(nextReq.url);
  const input = searchParams.get("input");
  const sessiontoken = searchParams.get("sessiontoken") ?? crypto.randomUUID();

  if (!input || input.trim().length < 1) {
    return jsonResponse({ predictions: [] });
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
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", input);
  url.searchParams.set("key", String(key));
  url.searchParams.set("language", "ko");
  url.searchParams.set("sessiontoken", sessiontoken);
  url.searchParams.set("components", "country:kr");
  url.searchParams.set("types", "geocode");

  const r = await fetch(url.toString());

  if (!r.ok) {
    return errorResponse(
      503,
      "UPSTREAM_UNAVAILABLE",
      "자동완성 상위 서비스를 일시적으로 사용할 수 없습니다.",
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

  return jsonResponse({ ...data, sessiontoken });
});
