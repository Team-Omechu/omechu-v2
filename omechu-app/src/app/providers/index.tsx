"use client";

import { ReactQueryProvider } from "@/shared/providers/ReactQueryProvider";

import { AuthProvider } from "./AuthProvider";
import { OnboardingGuard } from "./OnboardingGuard";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers
 * - 앱 전체에 필요한 Provider들을 통합
 * - ReactQueryProvider: 서버 상태 관리 (shared)
 * - AuthProvider: 인증 인터셉터 초기화
 * - OnboardingGuard: 세션 복구 + 온보딩 리다이렉트
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <OnboardingGuard>{children}</OnboardingGuard>
      </AuthProvider>
    </ReactQueryProvider>
  );
}

// 개별 export
export { AuthProvider } from "./AuthProvider";
export { ProtectedRoute } from "./ProtectedRoute";
export { GuestRoute } from "./GuestRoute";
export { OnboardingGuard } from "./OnboardingGuard";
