"use client";

import { MotionProvider } from "@/shared/providers/MotionProvider";
import { ReactQueryProvider } from "@/shared/providers/ReactQueryProvider";

import { AuthProvider } from "./AuthProvider";
import { OnboardingGuard } from "./OnboardingGuard";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <MotionProvider>
          <OnboardingGuard>{children}</OnboardingGuard>
        </MotionProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}

// 개별 export
export { AuthProvider } from "./AuthProvider";
export { ProtectedRoute } from "./ProtectedRoute";
export { GuestRoute } from "./GuestRoute";
export { OnboardingGuard } from "./OnboardingGuard";
