// Next.js 16 proxy (구 middleware).
// 모든 요청에 대해 Supabase 세션을 갱신한다.
import type { NextRequest } from "next/server";

import { updateSession } from "@/shared/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 정적 자산 / 이미지 최적화는 제외
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
