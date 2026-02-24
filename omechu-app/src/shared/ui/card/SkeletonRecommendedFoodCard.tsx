export function SkeletonRecommendedFoodCard() {
  return (
    <div className="relative">
      <div className="bg-brand-secondary flex h-28 w-84 animate-pulse gap-5 rounded-2xl border-[1.5px] border-gray-200 p-3">
        <div className="h-22 w-22 rounded-2xl bg-gray-200" />
        <div className="flex w-48 flex-col gap-2 pt-1">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
