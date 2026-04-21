import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type QuestionAnswerState = {
  mealTime: string | null;
  purpose: string | null;
  mood: string | null;
  who: string | null;
  budget: string | null;
  exceptions: string[];
  addition: string[];
  currentStep: number;
};

type QuestionAnswerActions = {
  setMealTime: (mealTime: string) => void;
  setPurpose: (purpose: string) => void;
  setMood: (mood: string) => void;
  setWho: (who: string) => void;
  setBudget: (budget: string) => void;
  setCurrentStep: (step: number) => void;

  addException: (exception: string) => void;
  removeException: (exception: string) => void;
  resetExceptions: () => void;
  setExceptions: (exceptions: string[]) => void;

  addAddition: (addition: string) => void;
  removeAddition: (addition: string) => void;
  resetAddition: () => void;

  clearStepValue: (step: number) => void;

  questionReset: () => void;
};

const initialState: QuestionAnswerState = {
  mealTime: null,
  purpose: null,
  mood: null,
  who: null,
  budget: null,
  exceptions: [],
  addition: [],
  currentStep: 1,
};

export const useQuestionAnswerStore = create<
  QuestionAnswerState & QuestionAnswerActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMealTime: (mealTime) => set({ mealTime }),
      setPurpose: (purpose) => set({ purpose }),
      setMood: (mood) => set({ mood }),
      setWho: (who) => set({ who }),
      setBudget: (budget) => set({ budget }),
      setCurrentStep: (step) => set({ currentStep: step }),

      addException: (exception) => {
        const v = exception.trim();
        if (v.length === 0) return;

        const { exceptions } = get();
        if (!exceptions.includes(v)) {
          set({ exceptions: [...exceptions, v] });
        }
      },

      removeException: (exception) => {
        const v = exception.trim();
        const { exceptions } = get();
        set({ exceptions: exceptions.filter((e) => e !== v) });
      },

      resetExceptions: () => set({ exceptions: [] }),

      setExceptions: (exceptions) => {
        const unique = Array.from(
          new Set(
            exceptions
              .map((e) => e.trim())
              .filter((e): e is string => e.length > 0),
          ),
        );
        set({ exceptions: unique });
      },

      addAddition: (addition) => {
        const v = addition.trim();
        if (v.length === 0) return;

        const { addition: currentAddition } = get();
        if (!currentAddition.includes(v)) {
          set({ addition: [...currentAddition, v] });
        }
      },

      removeAddition: (addition) => {
        const v = addition.trim();
        const { addition: currentAddition } = get();
        set({ addition: currentAddition.filter((a) => a !== v) });
      },

      resetAddition: () => set({ addition: [] }),

      // step: 1~5
      clearStepValue: (step) => {
        if (step === 1) {
          set({ mealTime: null });
          return;
        }
        if (step === 2) {
          set({ purpose: null });
          return;
        }
        if (step === 3) {
          set({ mood: null });
          return;
        }
        if (step === 4) {
          set({ who: null });
          return;
        }
        if (step === 5) {
          set({ budget: null });
          return;
        }
      },

      questionReset: () =>
        set({
          mealTime: initialState.mealTime,
          purpose: initialState.purpose,
          mood: initialState.mood,
          who: initialState.who,
          budget: initialState.budget,
          currentStep: initialState.currentStep,
        }),
    }),
    {
      name: "question-answer-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
