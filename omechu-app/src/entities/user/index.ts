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
  type OAuthStartResponse,
  login,
  signup,
  sendVerificationCode,
  verifyVerificationCode,
  requestPasswordReset,
  resetPassword,
  logout,
  changePassword,
  getCurrentUserWithToken,
  getCurrentUser,
  startKakaoLogin,
  startGoogleLogin,
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

export { useKakaoLogin } from "./lib/hooks/useKakaoLogin";

export { useGoogleLogin } from "./lib/hooks/useGoogleLogin";

export {
  VALID_PROVIDERS,
  PROVIDER_DISPLAY_NAMES,
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
} from "./lib/constants";

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

export type { OAuthProvider } from "./model/auth.types";
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
