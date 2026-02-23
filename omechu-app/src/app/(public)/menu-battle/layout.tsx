import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오메추 | 오늘의 메뉴, 배틀로 결정",
  description:
    "룰렛을 멈춰 메뉴를 선택해보세요. 가장 가까운 사람이 오늘의 메뉴를 정합니다",
  openGraph: {
    title: "오메추 | 오늘의 메뉴, 배틀로 결정",
    description:
      "룰렛을 멈춰 메뉴를 선택해보세요. 가장 가까운 사람이 오늘의 메뉴를 정합니다",
    type: "website",
    url: "/menu-battle",
  },
  twitter: {
    title: "오메추 | 오늘의 메뉴, 배틀로 결정",
    description:
      "룰렛을 멈춰 메뉴를 선택해보세요. 가장 가까운 사람이 오늘의 메뉴를 정합니다",
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
