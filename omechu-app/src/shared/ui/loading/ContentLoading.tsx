/**
 * ContentLoading
 * - 페이지 본문 영역 로딩 (헤더/네비 유지).
 * - 사용 컨텍스트: react-query isLoading 분기, Suspense fallback, Next.js loading.tsx.
 * - 풀스크린 게이트 컨텍스트는 MainLoading 사용.
 */
export function ContentLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div
        className="animate-food-cycle h-[170px] w-[175px] origin-center scale-[0.7] bg-[url('/image/food-sprite.svg')]"
        style={{ backgroundSize: "525px 170px" }}
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}
