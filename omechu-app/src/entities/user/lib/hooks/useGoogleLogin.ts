"use client";

import { useCallback, useEffect, useState } from "react";

import { startGoogleLogin } from "@/entities/user/api/authApi";
import { useToast } from "@/shared";

/**
 * 구글 로그인 훅 (BE API 방식)
 * - initiateGoogleLogin: 구글 로그인 시작 (authorizeUrl로 리다이렉트)
 */
export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { triggerToast } = useToast();

  // Reset loading state when page is restored from bfcache
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsLoading(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const isSafeAuthorizeUrl = (value: string) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" && url.hostname === "accounts.google.com"
      );
    } catch {
      return false;
    }
  };

  /**
   * 구글 로그인 시작
   * 1. BE에 redirectUri 전송
   * 2. authorizeUrl 응답 받음
   * 3. authorizeUrl로 리다이렉트
   */
  const initiateGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      // 현재 origin + 콜백 경로로 redirectUri 생성
      const redirectUri = `${window.location.origin}/auth/callback/google`;

      // BE API 호출하여 authorizeUrl 받기
      const { authorizeUrl } = await startGoogleLogin(redirectUri);

      if (!isSafeAuthorizeUrl(authorizeUrl)) {
        throw new Error("유효하지 않은 인증 URL입니다.");
      }

      // 구글 로그인 페이지로 이동
      window.location.href = authorizeUrl;
    } catch (error) {
      console.error("[Google Login] Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "구글 로그인 중 오류가 발생했습니다.";
      triggerToast(errorMessage);
      setIsLoading(false);
    }
    // 참고: 리다이렉트 되므로 setIsLoading(false)는 에러 시에만 호출
  }, [triggerToast]);

  // 기존 호환성을 위해 handleGoogleLogin도 export
  return {
    initiateGoogleLogin,
    handleGoogleLogin: initiateGoogleLogin,
    isLoading,
  };
};
