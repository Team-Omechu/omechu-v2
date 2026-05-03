let lockCount = 0;
let previousOverflow: string | null = null;
let previousPaddingRight: string | null = null;

/*
  scrollbar-gutter:stable(globals.css)와 함께 동작.
  정상 케이스에선 트랙이 reserve되어 paddingDiff=0,
  엣지 케이스(브라우저/모드별 gutter 미적용 등)에 한해 paddingRight 보정으로 layout shift 방지.
*/
export function lockBodyScroll() {
  if (typeof window === "undefined") return;
  if (lockCount === 0) {
    const body = document.body;
    const docEl = document.documentElement;
    const scrollbarWidth = window.innerWidth - docEl.clientWidth;

    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
  }
  lockCount += 1;
}

export function unlockBodyScroll() {
  if (typeof window === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? "";
    document.body.style.paddingRight = previousPaddingRight ?? "";
    previousOverflow = null;
    previousPaddingRight = null;
  }
}
