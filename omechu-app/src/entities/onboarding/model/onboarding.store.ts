import { create } from "zustand";
// 기본 상태 입력 정보 Local Storage 임시 저장을 위해 persist 미들웨어 추가
import { persist } from "zustand/middleware";

const normExercise = (v?: string | null) => {
  const s = (v ?? "").trim();
  if (!s) return null;
  const u = s.toUpperCase();
  if (
    u === "DIET" ||
    u === "DIETING" ||
    u === "CUTTING" ||
    s.includes("다이어트")
  )
    return "다이어트 중";
  if (u === "BULK" || u === "BULKING" || s.includes("증량")) return "증량 중";
  if (
    u === "MAINTAIN" ||
    u === "MAINTAINING" ||
    u === "MAINTENANCE" ||
    s.includes("유지")
  )
    return "유지 중";
  return s; // 이미 라벨일 가능성
};
const normBodyType = (v?: string | null) => {
  const s = (v ?? "").replace(/\s+/g, "");
  if (!s) return null;
  if (s.includes("더위")) return "더위잘탐";
  if (s.includes("추위")) return "추위잘탐";
  if (s.includes("감기")) return "감기";
  if (s.includes("소화")) return "소화불량";
  return v ?? null;
};
const normPrefer = (v?: string | null) => {
  const s = (v ?? "").trim();
  if (!s) return null;
  const noSpace = s.replace(/\s+/g, "");
  if (["한식", "양식", "중식", "일식", "다른나라"].includes(noSpace))
    return noSpace;
  const u = s.toUpperCase();
  if (u === "KOR") return "한식";
  if (u === "WES" || u === "WESTERN") return "양식";
  if (u === "CHI" || u === "CHINESE") return "중식";
  if (u === "JPN" || u === "JAPANESE") return "일식";
  if (noSpace.includes("다른나라")) return "다른나라";
  return s; // 최대한 보존
};
const VALID_ALLERGY_LABELS = new Set([
  "달걀",
  "우유",
  "메밀",
  "대두",
  "밀",
  "땅콩",
  "호두",
  "잣",
  "돼지고기",
  "소고기",
  "닭고기",
  "고등어",
  "새우",
  "게",
  "오징어",
  "조개류",
  "복숭아",
  "토마토",
  "아황산류",
  "그 외",
]);

const ENUM_TO_LABEL: Record<string, string> = {
  egg: "달걀",
  milk: "우유",
  buckwheat: "메밀",
  soybean: "대두",
  soy: "대두",
  wheat: "밀",
  peanut: "땅콩",
  walnut: "호두",
  pine_nut: "잣",
  pork: "돼지고기",
  beef: "소고기",
  chicken: "닭고기",
  mackerel: "고등어",
  shrimp: "새우",
  crab: "게",
  squid: "오징어",
  shellfish: "조개류",
  peach: "복숭아",
  tomato: "토마토",
  sulfites: "아황산류",
  other: "그 외",
};

const normAllergy = (v?: string | null) => {
  const s = (v ?? "").trim();
  if (!s) return null;
  if (VALID_ALLERGY_LABELS.has(s)) return s;
  const fromEnum = ENUM_TO_LABEL[s.toLowerCase()];
  if (fromEnum) return fromEnum;
  return null;
};
const uniq = <T>(arr: T[]) => Array.from(new Set(arr));
const toArray = (v: unknown): unknown[] =>
  Array.isArray(v) ? v : v ? [v] : [];

type OnboardingState = {
  nickname: string;
  exercise: string | null;
  prefer: string[];
  bodyType: string[];
  allergy: string[];
  currentStep: number;
  preferHydrateBlocked: boolean;
};

type OnboardingActions = {
  setNickname: (nickname: string) => void;
  setExercise: (exercise: string | null) => void;
  setPrefer: (prefer: string[]) => void;
  setBodyType: (bodyType: string[]) => void;
  setAllergy: (allergy: string[]) => void;
  togglePrefer: (prefer: string) => void;
  toggleBodyType: (item: string) => void;
  toggleAllergy: (allergy: string) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  resetExercise: () => void;
  resetPrefer: () => void;
  resetBodyType: () => void;
  resetAllergy: () => void;
  hydrateFromProfile: (raw: unknown) => void;
  blockPreferHydrate: () => void;
  softReset: () => void;
  hardReset: () => void;
};

const initialState: OnboardingState = {
  nickname: "",
  exercise: null,
  prefer: [],
  bodyType: [],
  allergy: [],
  currentStep: 1,
  preferHydrateBlocked: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setNickname: (nickname) => set({ nickname }),
      setExercise: (exercise) => set({ exercise }),
      setPrefer: (prefer) => set({ prefer }),
      setBodyType: (bodyType: string[]) => set({ bodyType }),
      setAllergy: (allergy: string[]) => set({ allergy }),

      hydrateFromProfile: (raw: unknown) => {
        if (!raw) return;

        const profile = raw as Record<string, unknown>;
        const nickname =
          (profile?.nickname as string) ?? (profile?.name as string) ?? "";

        const exercise = normExercise(
          (profile?.exercise as string) ?? (profile?.state as string) ?? null,
        );

        const preferArr = uniq(
          toArray(profile?.prefer)
            .map((v) => normPrefer(v as string)!)
            .filter(Boolean) as string[],
        ).slice(0, 2);

        const bodyTypeFirst = normBodyType(
          (profile?.bodyType as string) ??
            (profile?.body_type as string) ??
            null,
        );
        const bodyType = bodyTypeFirst ? [bodyTypeFirst] : [];

        const allergy = uniq(
          toArray(profile?.allergy)
            .map((v) => normAllergy(v as string)!)
            .filter(Boolean) as string[],
        );

        set({
          nickname,
          exercise,
          prefer: preferArr,
          bodyType,
          allergy,
        });
      },

      togglePrefer: (prefer) => {
        const exists = get().prefer.includes(prefer);
        const current = get().prefer;

        if (exists) return set({ prefer: current.filter((f) => f !== prefer) });
        if (current.length >= 2) return;
        return set({ prefer: [...current, prefer] });
      },

      toggleBodyType: (item) => {
        const exists = get().bodyType.includes(item);
        return set({ bodyType: exists ? [] : [item] });
      },

      toggleAllergy: (allergy) => {
        const current = get().allergy;
        const exists = current.includes(allergy);
        return set({
          allergy: exists
            ? current.filter((a) => a !== allergy)
            : [...current, allergy],
        });
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      blockPreferHydrate: () => set({ preferHydrateBlocked: true }),

      softReset: () => {
        const { nickname } = get();
        set({
          nickname,
          exercise: null,
          prefer: [],
          bodyType: [],
          allergy: [],
          currentStep: 1,
          preferHydrateBlocked: false,
        });
      },

      hardReset: () => {
        set({
          ...initialState,
          preferHydrateBlocked: false,
        });
        try {
          localStorage.removeItem("onboarding-storage");
        } catch {
          //
        }
      },

      reset: () => {
        // alias for backward compatibility (hard reset)
        get().hardReset();
      },

      resetExercise: () => set({ exercise: null }),
      resetPrefer: () => set({ prefer: [] }),
      resetBodyType: () => set({ bodyType: [] }),
      resetAllergy: () => set({ allergy: [] }),
    }),
    {
      name: "onboarding-storage",
    },
  ),
);
