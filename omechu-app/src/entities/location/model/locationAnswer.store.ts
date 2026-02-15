import { create } from "zustand";

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
>((set) => ({
  ...initialState,
  setX: (x) => set({ x }),
  setY: (y) => set({ y }),
  setRadius: (radius) => set({ radius }),
  setKeyword: (keyword) => set({ keyword }),
  setLocationDenied: (v) => set({ locationDenied: v }),

  locationReset: () => set(initialState),
}));
