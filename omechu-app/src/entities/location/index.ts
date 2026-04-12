// FSD: location 스토어/유틸은 shared로 이동 (cross-entity 의존 해소)
// 기존 import 호환을 위해 re-export
export { handleLocation } from "@/shared/lib/handleLocation";
export { useLocationAnswerStore } from "@/shared/store/locationAnswer.store";
