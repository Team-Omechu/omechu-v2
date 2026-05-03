// Supabase 기반 인증 API.
// 기존 authApi(axios → /auth/*)를 대체한다.
import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

export interface SignUpInput {
  email: string;
  password: string;
  nickname?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signUpWithEmail({
  email,
  password,
  nickname,
}: SignUpInput) {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }: SignInInput) {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const sb = createSupabaseBrowserClient();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

// 소셜 로그인 공용 응답 타입
interface OAuthLoginResult {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

type EdgeEnvelope<T> = {
  resultType: "SUCCESS" | "FAIL";
  success: T | null;
  error: { errorCode: string; reason: string } | null;
};

async function exchangeOAuthCode(
  functionName: "google-login" | "kakao-login",
  code: string,
  redirectUri: string,
  defaultError: string,
): Promise<OAuthLoginResult> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.functions.invoke<
    EdgeEnvelope<OAuthLoginResult>
  >(functionName, { body: { code, redirectUri } });
  if (error) throw error;
  if (!data || data.resultType !== "SUCCESS" || !data.success) {
    throw new Error(data?.error?.reason ?? defaultError);
  }
  const { error: setErr } = await sb.auth.setSession({
    access_token: data.success.accessToken,
    refresh_token: data.success.refreshToken,
  });
  if (setErr) throw setErr;
  return data.success;
}

// Google OAuth authorize URL로 리다이렉트.
// Supabase 네이티브 provider 대신 google-login edge function 경로를 사용해
// 리다이렉트 체인에서 Supabase 서브도메인 노출을 피함.
export function beginGoogleLogin(redirectUri?: string): void {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID missing");

  const finalRedirect =
    redirectUri ??
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
    `${window.location.origin}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: finalRedirect,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function signInWithGoogleCode(code: string, redirectUri: string) {
  return exchangeOAuthCode(
    "google-login",
    code,
    redirectUri,
    "google_login_failed",
  );
}

// Kakao authorize URL로 리다이렉트 (Google과 대칭). client_id는 REST API 키.
// Kakao REST API 키는 OAuth client_id로 공개 노출 허용된 값이므로 NEXT_PUBLIC_ 가능.
export function beginKakaoLogin(redirectUri?: string): void {
  const restKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!restKey) throw new Error("NEXT_PUBLIC_KAKAO_REST_API_KEY missing");

  const finalRedirect =
    redirectUri ??
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ??
    `${window.location.origin}/auth/kakao/callback`;

  const params = new URLSearchParams({
    client_id: restKey,
    redirect_uri: finalRedirect,
    response_type: "code",
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function signInWithKakaoCode(code: string, redirectUri: string) {
  return exchangeOAuthCode(
    "kakao-login",
    code,
    redirectUri,
    "kakao_login_failed",
  );
}

export async function sendVerificationCodeEmail(email: string) {
  // signInWithOtp: 비밀번호 없이 OTP만 발송. 신규/기존 유저 모두 동작.
  const sb = createSupabaseBrowserClient();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailCode(email: string, code: string) {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const sb = createSupabaseBrowserClient();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// 현재 비밀번호 검증 후 새 비밀번호로 교체.
// Supabase는 updateUser({password})에서 현재 비밀번호 확인을 안 하므로
// signInWithPassword로 재인증해서 검증을 대신 한다.
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const sb = createSupabaseBrowserClient();
  const { data: userData, error: getUserErr } = await sb.auth.getUser();
  if (getUserErr) throw getUserErr;
  const email = userData.user?.email;
  if (!email) throw new Error("이메일 정보를 찾을 수 없습니다.");

  const { error: reauthErr } = await sb.auth.signInWithPassword({
    email,
    password: input.currentPassword,
  });
  if (reauthErr) {
    throw new Error("현재 비밀번호가 일치하지 않습니다.");
  }

  const { data, error } = await sb.auth.updateUser({
    password: input.newPassword,
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const sb = createSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error) throw error;
  return user;
}

export async function withdraw(reason: string) {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.functions.invoke("withdraw", {
    body: { reason },
  });
  if (error) throw error;
  await sb.auth.signOut();
  return data;
}
