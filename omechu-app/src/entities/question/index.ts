// FSD: question 스토어/옵션은 shared로 이동 (cross-entity 의존 해소)
// 기존 import 호환을 위해 re-export
export {
  mealTimeOptions,
  whoOptions,
  moodOptions,
  budgetOptions,
  purposeOptions,
} from "@/shared/config/questionOptions";
export { useQuestionAnswerStore } from "@/shared/store/questionAnswer.store";
