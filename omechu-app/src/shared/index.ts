// ============================================
// shared 레이어 배럴 export
// FSD 규칙: shared는 다른 레이어에 의존하지 않음
// ============================================

// Config
export type { ApiResponse, ApiError } from "./config/api.types";

// Terms Config
export type { TermsItem, TermsType, TermsConfig } from "./constants/terms";

// Store (cross-entity 스토어)
export { useLocationAnswerStore } from "./store/locationAnswer.store";
export { useQuestionAnswerStore } from "./store/questionAnswer.store";

// Lib
export { handleLocation } from "./lib/handleLocation";
export { axiosInstance, setupAxiosInterceptors } from "./lib/axiosInstance";
export type { AuthStoreGetter } from "./lib/axiosInstance";
export { HttpError, toHttpError } from "./lib/httpError";
export { lockBodyScroll, unlockBodyScroll } from "./lib/bodyScrollLock";
export { profileSchema } from "./lib/onboarding.schema";
export { useToast } from "./lib/useToast";
export type { UseToastReturn, UseToastOptions } from "./lib/useToast";
export { useShareUrl } from "./lib/useShareUrl";

// Providers (entities 의존 없는 순수 providers만)
// NOTE: ProtectedRoute, OnboardingGuard는 app/providers에 있음 (FSD: entities 의존)
export { ReactQueryProvider } from "./providers/ReactQueryProvider";

// UI Components
export { Header } from "./ui/Header";
export { MainLoading } from "./ui/MainLoading";
export { PageTransition } from "./ui/PageTransition";

export { ProgressBar } from "./ui/ProgressBar";
export { SearchBar } from "./ui/SearchBar";

// UI - Box
export { CheckBox } from "./ui/box/CheckBox";
export { FoodBox } from "./ui/box/FoodBox";
export { SkeletonUIFoodBox } from "./ui/box/SkeletonUIFoodBox";

// UI - Button
export { BottomButton } from "./ui/button/BottomButton";
export { Button } from "./ui/button/Button";
export { PaginationButton } from "./ui/button/PaginationButton";

// UI - Card
// FoodCard는 widgets/card로 이동 (FSD: entities 의존)
export { IngredientCard } from "./ui/card/IngredientCard";
export { RecommendedFoodCard } from "./ui/card/RecommendedFoodCard";
export { SkeletonRecommendedFoodCard } from "./ui/card/SkeletonRecommendedFoodCard";
export { RestaurantCard } from "./ui/card/RestaurantCard";

// UI - Modal
export { ModalWrapper } from "./ui/modal/ModalWrapper";
export { BaseModal } from "./ui/modal/BaseModal";

// UI - Toast
export { Toast } from "./ui/toast/Toast";

// UI - Input
export { HelperText } from "./ui/input/HelperText";
export { Input } from "./ui/input/Input";
export { Label } from "./ui/input/Label";

// UI - Form
export { FormField } from "./ui/form-field/FormField";

// UI - Terms
export { TermsContent } from "./ui/terms";
