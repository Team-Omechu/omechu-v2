// 이메일 확인 / 매직링크 / 비밀번호 재설정 콜백 전용.
// URL에 `code`가 실려 들어오면 exchangeCodeForSession으로 세션 쿠키를 설정한다.
// 소셜 로그인(Google/Kakao)은 전용 /auth/{provider}/callback + edge function 경로 사용.
import { NextResponse } from "next/server";

import { createClient as createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=oauth_failed", url.origin),
  );
}
