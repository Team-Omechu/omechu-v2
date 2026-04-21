import { GuestRoute } from "@/app/providers";

/**
 * (auth) 라우트 그룹 공통 레이아웃
 * - 이미 로그인된 유저가 로그인/회원가입/비밀번호 찾기 페이지에 접근하면 /mainpage로 리다이렉트
 * - 개별 페이지 레이아웃(로고 등)은 하위 login/layout.tsx에서 처리
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestRoute>{children}</GuestRoute>;
}
