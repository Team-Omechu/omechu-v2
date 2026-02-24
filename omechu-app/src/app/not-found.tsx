import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[375px] space-y-4 text-center">
        <p className="text-6xl font-bold text-[#ff7676]">404</p>
        <h1 className="text-xl font-bold text-[#242424]">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm text-[#707070]">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/mainpage"
          className="inline-block rounded-xl bg-[#ff7676] px-6 py-3 text-sm font-semibold text-white"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
