import { errorResponse, jsonResponse } from "@/app/api/_lib/http";
import { withErrorHandler } from "@/app/api/_lib/withErrorHandler";

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return errorResponse(
      400,
      "ADDRESS_REQUIRED",
      "주소 파라미터가 필요합니다.",
    );
  }

  const apiKey = process.env.GOOGLE_MAP_SERVER_API_KEY;

  if (!apiKey) {
    return errorResponse(
      500,
      "MAP_API_KEY_MISSING",
      "서버 API 키가 설정되지 않았습니다.",
    );
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address,
  )}&key=${apiKey}`;

  const res = await fetch(url);

  if (!res.ok) {
    return errorResponse(
      503,
      "UPSTREAM_UNAVAILABLE",
      "지오코딩 상위 서비스를 일시적으로 사용할 수 없습니다.",
      { upstreamStatus: res.status },
      { "Retry-After": "30" },
    );
  }

  const data = await res.json();

  return jsonResponse(data);
});
