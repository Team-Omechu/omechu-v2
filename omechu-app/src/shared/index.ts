// ============================================
// shared 레이어 배럴 export
// FSD 규칙: shared는 다른 레이어에 의존하지 않음
// ============================================

// Types
// Restaurant 타입은 entities/restaurant/model/restaurant.types.ts로 이동 (FSD)

// Config
export type { ApiResponse, ApiError } from "./config/api.types";
export {
  filteredChoSeong,
  consonantGroupMap,
  HANGUL_CHO_SEONG,
} from "./config/choSeong";
export type { MenuDetail, Menu } from "./config/menu";
export {
  type StepKey,
  stepOrder,
  slugToIndex,
  indexToSlug,
} from "./config/userInfoEditSteps";

// Terms Config
export type { TermsItem, TermsType, TermsConfig } from "./constants/terms";

// Lib
export { axiosInstance, setupAxiosInterceptors } from "./lib/axiosInstance";
export type { AuthStoreGetter } from "./lib/axiosInstance";
export { lockBodyScroll, unlockBodyScroll } from "./lib/bodyScrollLock";
export { profileSchema } from "./lib/onboarding.schema";
export { useToast } from "./lib/useToast";
export type { UseToastReturn, UseToastOptions } from "./lib/useToast";

// Providers (entities 의존 없는 순수 providers만)
// NOTE: ProtectedRoute, OnboardingGuard는 app/providers에 있음 (FSD: entities 의존)
export { ReactQueryProvider } from "./providers/ReactQueryProvider";

// API
export { getPresignedUrl, uploadToS3 } from "./api/image";

// UI Components
export { Header } from "./ui/Header";
export { MainLoading } from "./ui/MainLoading";

export { ProgressBar } from "./ui/ProgressBar";
export { SearchBar } from "./ui/SearchBar";

// UI - Box
export { CheckBox } from "./ui/box/CheckBox";
export { FoodBox } from "./ui/box/FoodBox";
export { SkeletonUIFoodBox } from "./ui/box/SkeletonUIFoodBox";

// UI - Button
export { BottomButton } from "./ui/button/BottomButton";
export { BattleButton } from "./ui/button/BattleButton";
export { Button } from "./ui/button/Button";
export { OnboardingButton } from "./ui/button/OnboardingButton";
export { PaginationButton } from "./ui/button/PaginationButton";
export { RandomDrawButton } from "./ui/button/RandomDrawButton";
export { ListButton } from "./ui/button/ListButton";

// UI - Card
// FoodCard는 widgets/card로 이동 (FSD: entities 의존)
export { IngredientCard } from "./ui/card/IngredientCard";
export { RecommendedFoodCard } from "./ui/card/RecommendedFoodCard";
export { RestaurantCard } from "./ui/card/RestaurantCard";

// UI - Modal
export { ModalWrapper } from "./ui/modal/ModalWrapper";
export { BaseModal } from "./ui/modal/BaseModal";
export { MenuModal } from "./ui/modal/MenuModal";
export { BattleModal } from "./ui/modal/BattleModal";

export { MypageModal } from "./ui/modal/MypageModal";

// UI - Toast
export { Toast } from "./ui/toast/Toast";

// UI - Input
export { HelperText } from "./ui/input/HelperText";
export { Input } from "./ui/input/Input";
export { Label } from "./ui/input/Label";

// UI - Form
export { FormField } from "./ui/form-field/FormField";

// UI - Auth
export { AuthButton } from "./ui/auth";

// UI - Terms
export { TermsContent } from "./ui/terms";
