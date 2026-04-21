// ! 26.01.04 작업 완료

interface IngredientCardProps {
  kcal?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  vitamin?: string[];
  allergies?: string[];
  onCardClick?: () => void;
}

export function IngredientCard({
  kcal,
  carbohydrate,
  protein,
  fat,
  vitamin,
  allergies,
  onCardClick,
}: IngredientCardProps) {
  const rawAllergies = Array.isArray(allergies)
    ? allergies.join(",")
    : typeof allergies === "string"
      ? allergies
      : allergies === null || allergies === undefined
        ? ""
        : String(allergies);

  const allergyText = rawAllergies.trim()
    ? rawAllergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ")
    : "없음";

  return (
    <section className="w-full">
      <div className="text-body-3-medium text-font-high mb-3 ml-0.5">
        메뉴 정보
      </div>
      <div
        className="bg-background-secondary h-fit w-81.5 rounded-2xl p-5"
        onClick={onCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onCardClick?.();
          }
        }}
        role="button"
        aria-pressed={undefined}
        tabIndex={0}
      >
        <div className="w-full">
          <div className="mb-2 text-base font-medium text-[#bdbdbd]">
            기본 영양 정보
          </div>
          <div className="flex">
            <div className="text-body-4-medium text-font-high flex w-20 flex-col gap-1.5 font-bold">
              <div>칼로리</div>
              <div>탄수화물</div>
              <div>단백질</div>
              <div>지방</div>
              <div>비타민</div>
            </div>
            <div className="text-body-4-regular text-font-medium flex flex-1 flex-col gap-1.5">
              <div>{kcal ? `${kcal} kcal` : ""}</div>
              <div>{carbohydrate ? `${carbohydrate} g` : ""}</div>
              <div>{protein ? `${protein} g` : ""}</div>
              <div>{fat ? `${fat} g` : ""}</div>
              <div>{vitamin}</div>
            </div>
          </div>
        </div>
        <div className="border-component-default my-3 border" />
        <div>
          <div className="mb-2 text-base font-medium text-[#bdbdbd]">
            알레르기 유발 성분
          </div>
          <div className="text-body-4-medium text-font-high flex w-56 flex-col">
            {allergyText}
          </div>
        </div>
      </div>
    </section>
  );
}
