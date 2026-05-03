import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-[375px] space-y-4 text-center">
        <p className="text-brand-primary text-6xl font-bold">404</p>
        <h1 className="text-font-high text-xl font-bold">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-font-low text-sm">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/mainpage"
          className="bg-brand-primary inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
