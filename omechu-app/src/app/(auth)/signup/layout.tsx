import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "오메추 회원가입 후 취향 기반 맞춤 메뉴 추천을 받아보세요.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    url: "/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
