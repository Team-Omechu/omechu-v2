import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LocationAnswerState = {
  x: number;
  y: number;
  radius: number;
  keyword: string | null;
  locationDenied: boolean;
};

type LocationAnswerActions = {
  setX: (x: number) => void;
  setY: (y: number) => void;
  setRadius: (radius: number) => void;
  setKeyword: (keyword: string) => void;
  setLocationDenied: (v: boolean) => void;
  locationReset: () => void;
};

const initialState: LocationAnswerState = {
  x: 0,
  y: 0,
  radius: 500,
  keyword: null,
  locationDenied: false,
};

export const useLocationAnswerStore = create<
  LocationAnswerState & LocationAnswerActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setX: (x) => set({ x }),
      setY: (y) => set({ y }),
      setRadius: (radius) => set({ radius }),
      setKeyword: (keyword) => set({ keyword }),
      setLocationDenied: (v) => set({ locationDenied: v }),
      locationReset: () => set(initialState),
    }),
    {
      name: "location-answer-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        x: s.x,
        y: s.y,
        radius: s.radius,
        keyword: s.keyword,
        locationDenied: s.locationDenied,
      }),
    },
  ),
);
