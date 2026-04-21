import { useTagStore } from "@/entities/tag";

export function TagCard() {
  const { mealTimeTag, purposeTag, moodTag, whoTag, budgetTag } = useTagStore();
  return (
    <div>
      <div className="text-font-high mb-1 flex flex-col p-1 text-sm">
        <span className="text-font-placeholder mb-1 text-[1.125rem] font-semibold">
          {mealTimeTag?.tag}
        </span>
        <span>{mealTimeTag?.description}</span>
      </div>
      <div className="text-font-high mb-1 flex flex-col p-1 text-sm">
        <span className="text-font-placeholder mb-1 text-[1.125rem] font-semibold">
          {purposeTag?.tag}
        </span>
        <span>{purposeTag?.description}</span>
      </div>
      <div className="text-font-high mb-1 flex flex-col p-1 text-sm">
        <span className="text-font-placeholder mb-1 text-[1.125rem] font-semibold">
          {moodTag?.tag}
        </span>
        <span>{moodTag?.description}</span>
      </div>
      <div className="text-font-high mb-1 flex flex-col p-1 text-sm">
        <span className="text-font-placeholder mb-1 text-[1.125rem] font-semibold">
          {whoTag?.tag}
        </span>
        <span>{whoTag?.description}</span>
      </div>
      <div className="text-font-high mb-1 flex flex-col p-1 text-sm">
        <span className="text-font-placeholder mb-1 text-[1.125rem] font-semibold">
          {budgetTag?.tag}
        </span>
        <span>{budgetTag?.description}</span>
      </div>
    </div>
  );
}
