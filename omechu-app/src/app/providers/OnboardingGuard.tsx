"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore, useProfile } from "@/entities/user";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard
 * - 세션 복구 및 온보딩 미완료 사용자 리다이렉트 처리
 * - 로그인 후 닉네임이 없으면 /mypage로 이동 (마이페이지에서 닉네임 모달 자동 오픈)
 *
 * 참고: "이미 로그인한 유저가 /login 등에 접근"에 대한 차단은
 *  (auth)/layout.tsx의 GuestRoute가 담당함
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const { data: sessionUser, isSuccess, isError } = useProfile();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    const from401 =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("from") === "401";

    if (isLoggedIn || isError) return;

    if (isSuccess && sessionUser) {
      useAuthStore.getState().setUser(sessionUser);

      if (from401) return;

      if (!sessionUser.nickname) {
        router.push("/mypage");
      }
    }
  }, [isSuccess, isError, sessionUser, isLoggedIn, router]);

  return <>{children}</>;
}
