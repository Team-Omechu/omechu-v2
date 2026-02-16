import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { TagData } from "@/entities/menu";

export type TagState = {
  mealTimeTag: TagData | null;
  purposeTag: TagData | null;
  moodTag: TagData | null;
  whoTag: TagData | null;
  budgetTag: TagData | null;
};

type TagActions = {
  setMealTimeTag: (tag: string, description: string) => void;
  setPurposeTag: (tag: string, description: string) => void;
  setMoodTag: (tag: string, description: string) => void;
  setWhoTag: (tag: string, description: string) => void;
  setBudgetTag: (tag: string, description: string) => void;

  // ✅ 추가: step 기준 태그 정리
  clearStepTag: (step: number) => void;

  tagDataReset: () => void;
};

const initialTagData: TagState = {
  mealTimeTag: null,
  purposeTag: null,
  moodTag: null,
  whoTag: null,
  budgetTag: null,
};

export const useTagStore = create<TagState & TagActions>()(
  persist(
    (set) => ({
      ...initialTagData,

      setMealTimeTag: (tag, description) =>
        set({ mealTimeTag: { tag, description } }),
      setPurposeTag: (tag, description) =>
        set({ purposeTag: { tag, description } }),
      setMoodTag: (tag, description) => set({ moodTag: { tag, description } }),
      setWhoTag: (tag, description) => set({ whoTag: { tag, description } }),
      setBudgetTag: (tag, description) =>
        set({ budgetTag: { tag, description } }),

      // ✅ 현재 step의 태그만 지움
      // step: 1~5 (현재 보고 있는 페이지 step)
      clearStepTag: (step) => {
        if (step === 1) {
          set({ mealTimeTag: null });
          return;
        }
        if (step === 2) {
          set({ purposeTag: null });
          return;
        }
        if (step === 3) {
          set({ moodTag: null });
          return;
        }
        if (step === 4) {
          set({ whoTag: null });
          return;
        }
        if (step === 5) {
          set({ budgetTag: null });
          return;
        }
      },

      tagDataReset: () => set(initialTagData),
    }),
    {
      name: "tag-data-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
