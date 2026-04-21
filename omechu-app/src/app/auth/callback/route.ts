// OAuth / Magic link callback.
// Supabase가 URL에 `code`를 붙여 리다이렉트 → exchangeCodeForSession으로 세션 쿠키 설정.
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
