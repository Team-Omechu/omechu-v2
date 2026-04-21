"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/entities/user";

import { MainLoading } from "@/shared";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute
 * - 비로그인 전용 페이지를 감싸는 컴포넌트
 * - 이미 로그인된 상태면 /mainpage로 리다이렉트
 * - ProtectedRoute의 반대 역할 (`(auth)` 라우트 그룹에서 사용)
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndProceed = (authStatus: boolean) => {
      if (authStatus) {
        router.replace("/mainpage");
      } else {
        setIsChecking(false);
      }
    };

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      checkAuthAndProceed(useAuthStore.getState().isLoggedIn);
    });

    if (useAuthStore.persist.hasHydrated()) {
      checkAuthAndProceed(useAuthStore.getState().isLoggedIn);
    }

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn, router]);

  if (isChecking) {
    return <MainLoading />;
  }

  return <>{children}</>;
}
