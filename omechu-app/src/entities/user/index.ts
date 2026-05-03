// Supabase 기반 Public API (권장)
export {
  signUpWithEmail,
  signInWithEmail,
  signOut as signOutSupabase,
  beginGoogleLogin,
  signInWithGoogleCode,
  beginKakaoLogin,
  signInWithKakaoCode,
  sendVerificationCodeEmail,
  verifyEmailCode,
  requestPasswordReset as requestPasswordResetSupabase,
  updatePassword,
  changePassword,
  getCurrentUser as getCurrentUserSupabase,
  withdraw,
  type SignUpInput,
  type SignInInput,
} from "./api/supabaseAuth";

export {
  fetchProfile as fetchProfileSupabase,
  updateProfile as updateProfileSupabase,
  setPreferences,
  setAllergies,
  setAllergiesByLabels,
  submitInquiry,
  saveAgreement,
  type PreferKind,
  type ExerciseKind,
} from "./api/supabaseProfile";

export { ApiClientError } from "@/shared/lib/apiClientError";
export type { ApiResponse, ApiError } from "@/shared/config/api.types";

export {
  fetchRecommendManagement,
  exceptMenu,
  removeExceptMenu,
} from "./api/recommendApi";

export {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useSendVerificationCodeMutation,
  useVerifyVerificationCodeMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from "./lib/hooks/useAuth";

export { useProfile, useUpdateProfileMutation } from "./lib/hooks/useProfile";

export {
  useRecommendManagement,
  useExceptMenuMutation,
  useRemoveExceptMenuMutation,
} from "./lib/hooks/useRecommendManagement";

export { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "./lib/constants";

export {
  loginSchema,
  type LoginFormValues,
  signupSchema,
  type SignupFormValues,
  findPasswordSchema,
  type FindPasswordFormValues,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "./model/auth.schema";

export { useAuthStore } from "./model/auth.store";

export type {
  ProfileType,
  UpdateProfileBody,
  WithdrawRequestBody,
  WithdrawResponse,
  InquiryRequestBody,
  InquiryResponse,
  ExerciseType,
  PreferType,
  AllergyType,
} from "./model/profile.types";

export type {
  RecommendMenuItem,
  RecommendManagementSummary,
  RecommendManagementResponse,
  ExceptMenuRequest,
  ExceptMenuResponse,
  RemoveExceptMenuRequest,
  RemoveExceptMenuResponse,
} from "./model/recommend.types";
