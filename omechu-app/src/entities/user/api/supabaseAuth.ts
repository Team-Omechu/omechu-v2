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

export async function signInWithGoogle() {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithKakaoCode(code: string, redirectUri: string) {
  // 카카오는 Supabase 네이티브 미지원. kakao-login edge function 호출.
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.functions.invoke<{
    resultType: "SUCCESS" | "FAIL";
    success: {
      userId: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expiresAt: number;
    } | null;
    error: { errorCode: string; reason: string } | null;
  }>("kakao-login", {
    body: { code, redirectUri },
  });
  if (error) throw error;
  if (!data || data.resultType !== "SUCCESS" || !data.success) {
    throw new Error(data?.error?.reason ?? "kakao_login_failed");
  }
  // 받은 토큰으로 세션 설정
  const { error: setErr } = await sb.auth.setSession({
    access_token: data.success.accessToken,
    refresh_token: data.success.refreshToken,
  });
  if (setErr) throw setErr;
  return data.success;
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
