import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "오메추 | 오늘 뭐 먹지? 메뉴 추천 서비스",
  },
  description:
    "맞춤 추천, 메뉴 배틀, 랜덤 추천으로 오늘 먹을 메뉴를 빠르게 결정해 보세요.",
  alternates: {
    canonical: "/mainpage",
  },
  openGraph: {
    url: "/mainpage",
  },
};

export default function MainPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
