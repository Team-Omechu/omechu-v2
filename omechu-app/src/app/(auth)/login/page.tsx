"use client";

import Link from "next/link";
import { useState } from "react";

import { beginGoogleLogin, beginKakaoLogin } from "@/entities/user";

import { AuthButton, Toast, useToast } from "@/shared";

/**
 * 소셜 로그인 메인 페이지
 * - 카카오, 구글 로그인 버튼 (default)
 * - 이메일 로그인/회원가입 링크
 */
export default function LoginPage() {
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { show, message, triggerToast } = useToast();

  const handleKakao = () => {
    try {
      setKakaoLoading(true);
      beginKakaoLogin();
    } catch (e) {
      setKakaoLoading(false);
      triggerToast(
        e instanceof Error ? e.message : "카카오 로그인을 시작할 수 없습니다.",
      );
    }
  };

  const handleGoogle = () => {
    try {
      setGoogleLoading(true);
      beginGoogleLogin();
    } catch (e) {
      setGoogleLoading(false);
      triggerToast(
        e instanceof Error ? e.message : "구글 로그인을 시작할 수 없습니다.",
      );
    }
  };

  const anyLoading = kakaoLoading || googleLoading;

  return (
    <div className="flex flex-col items-center">
      <div className="mt-20 flex w-80 flex-col gap-6">
        <AuthButton
          variant="kakao"
          icon="/kakao/kakao.svg"
          iconAlt="카카오 아이콘"
          type="button"
          onClick={handleKakao}
          isLoading={kakaoLoading}
          disabled={anyLoading}
        >
          카카오 로그인
        </AuthButton>

        <AuthButton
          variant="google"
          icon="/google/google.svg"
          iconAlt="구글 아이콘"
          type="button"
          onClick={handleGoogle}
          isLoading={googleLoading}
          disabled={anyLoading}
        >
          구글로 로그인
        </AuthButton>
      </div>

      <div className="text-caption-1-regular mt-10 flex items-center gap-3">
        <Link href="/login/email" className="text-font-medium hover:underline">
          이메일 로그인
        </Link>
        <span className="text-caption-2-medium text-font-placeholder">ㅣ</span>
        <Link href="/signup" className="text-font-medium hover:underline">
          이메일 회원가입
        </Link>
      </div>

      <Toast message={message} show={show} />
    </div>
  );
}
