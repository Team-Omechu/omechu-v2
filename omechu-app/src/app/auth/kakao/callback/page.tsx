// 카카오 OAuth 리다이렉트 수신.
// URL ?code=...&state=... 로 도착 → edge function으로 넘겨 세션 발급 → 홈 이동.

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { signInWithKakaoCode } from "@/entities/user";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setError("missing_code");
      return;
    }
    const redirectUri =
      process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ??
      `${window.location.origin}/auth/kakao/callback`;

    signInWithKakaoCode(code, redirectUri)
      .then(() => router.replace("/"))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "kakao_login_failed";
        setError(msg);
      });
  }, [params, router]);

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-red-500">카카오 로그인 실패: {error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>카카오 로그인 처리 중…</p>
    </main>
  );
}
