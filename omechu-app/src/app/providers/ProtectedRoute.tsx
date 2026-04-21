"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/entities/user";

import { MainLoading } from "@/shared";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute
 * - 로그인이 필요한 페이지를 감싸는 컴포넌트
 * - 미로그인 시 /login으로 리다이렉트
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 인증 상태를 확인하고 라우팅을 처리하는 함수
    const checkAuthAndProceed = (authStatus: boolean) => {
      if (!authStatus) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    };

    // Zustand persist 하이드레이션 대기
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      checkAuthAndProceed(useAuthStore.getState().isLoggedIn);
    });

    // 이미 하이드레이션이 완료된 경우 (store에서 직접 읽어 stale 클로저 방지)
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
