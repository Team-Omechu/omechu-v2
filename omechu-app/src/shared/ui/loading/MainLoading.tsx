/**
 * MainLoading
 * - 풀스크린 로딩 오버레이.
 * - 사용 컨텍스트: Auth/Route 게이트 (ProtectedRoute, GuestRoute).
 * - 페이지 본문 로딩에는 ContentLoading 사용.
 * - z-index: modal(9999) 아래, 일반 fixed 요소(z-50) 위.
 */
export function MainLoading() {
  return (
    <div
      className="fixed inset-0 z-[60] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/image/loading-bg.png')" }}
    >
      <div
        className="animate-food-cycle absolute top-1/2 left-1/2 h-[170px] w-[175px] -translate-x-1/2 -translate-y-1/2 bg-[url('/image/food-sprite.svg')]"
        style={{ backgroundSize: "525px 170px" }}
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}
