import Image from "next/image";

import type { Metadata } from "next";

import { Header } from "@/shared/ui/header/Header";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "카카오, 구글, 이메일 로그인을 통해 오메추에서 맞춤 메뉴 추천을 시작해 보세요.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    url: "/login",
  },
};

/**
 * 로그인 관련 페이지 레이아웃
 * - 뒤로가기 헤더
 * - 로고 고정 위치
 * - 컨텐츠 중앙 정렬
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {/* 로고 - 고정 위치 */}
      <div className="mt-12 flex justify-center">
        <Image
          src="/logo/logo.png"
          alt="Omechu Logo"
          width={139}
          height={92}
          priority
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex flex-1 flex-col items-center">{children}</div>
    </>
  );
}
