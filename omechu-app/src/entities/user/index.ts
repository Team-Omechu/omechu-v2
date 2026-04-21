// Supabase 기반 Public API (새 경로 — 권장)
export {
  signUpWithEmail,
  signInWithEmail,
  signOut as signOutSupabase,
  signInWithGoogle,
  signInWithKakaoCode,
  sendVerificationCodeEmail,
  verifyEmailCode,
  requestPasswordReset as requestPasswordResetSupabase,
  updatePassword,
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
  submitInquiry as submitInquirySupabase,
  saveAgreement,
  type PreferKind,
  type ExerciseKind,
} from "./api/supabaseProfile";

// 레거시 axios 기반 (마이그레이션 완료 후 제거 예정)
export {
  ApiClientError,
  type ApiResponse,
  type ApiError,
  type LoginSuccessData,
  type LoginTokens,
  type SignupSuccessData,
  type SendVerificationCodeSuccessData,
  type VerifyVerificationCodeSuccessData,
  type RequestPasswordResetSuccessData,
  login,
  signup,
  sendVerificationCode,
  verifyVerificationCode,
  requestPasswordReset,
  resetPassword,
  logout,
  changePassword,
  getCurrentUser,
} from "./api/authApi";

export {
  fetchProfile,
  updateProfile,
  withdrawAccount,
  submitInquiry,
} from "./api/profileApi";

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
