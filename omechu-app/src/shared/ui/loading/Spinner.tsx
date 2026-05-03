import { cn } from "@/shared/lib/cn";

type SpinnerProps = {
  size?: number;
  className?: string;
};

/**
 * Spinner
 * - 작은 인라인 로딩 인디케이터.
 * - 사용 컨텍스트: 텍스트 자리 대체, 버튼 옆, 컴팩트 영역.
 * - 큰 영역에는 ContentLoading, 풀스크린은 MainLoading.
 */
export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn(
        "border-brand-primary/20 border-t-brand-primary inline-block animate-spin rounded-full border-2",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
