"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { useProfile } from "@/entities/user/lib/hooks/useProfile";
import { useAuthStore } from "@/entities/user/model/auth.store";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard
 * - 세션 복구 및 온보딩 미완료 사용자 리다이렉트 처리
 * - 로그인 후 닉네임이 없으면 /onboarding으로 이동
 *
 * 사용 예시:
 * - app/(public)/layout.tsx에서 적용
 * - 또는 특정 페이지에서만 적용 가능
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionUser, isSuccess, isError } = useProfile();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const inAuthSection =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  useEffect(() => {
    const from401 =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("from") === "401";

    if (isLoggedIn && inAuthSection) {
      router.replace("/mainpage");
      return;
    }

    // 이미 로그인 상태거나 세션 조회 에러면 아무것도 하지 않음
    if (isLoggedIn || isError) return;

    // 세션 복구 성공 시에만 상태 동기화
    if (isSuccess && sessionUser) {
      // 토큰은 콜백에서 설정되므로 여기서는 사용자 정보만 동기화
      useAuthStore.getState().setUser(sessionUser);

      // 401로 들어온 경우 또는 인증 섹션에서는 자동 리다이렉트하지 않음
      if (from401 || inAuthSection) return;

      // 온보딩 미완료 사용자는 온보딩으로 유도
      if (!sessionUser.nickname) {
        router.push("/onboarding");
      }
    }
  }, [isSuccess, isError, sessionUser, isLoggedIn, router, inAuthSection]);

  return <>{children}</>;
}
