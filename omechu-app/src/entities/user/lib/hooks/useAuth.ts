import { useMutation } from "@tanstack/react-query";

import {
  requestPasswordReset as requestPasswordResetFn,
  sendVerificationCodeEmail,
  signInWithEmail,
  signOut as signOutFn,
  updatePassword,
  verifyEmailCode,
} from "@/entities/user/api/supabaseAuth";
import { fetchProfile as fetchSupabaseProfile } from "@/entities/user/api/supabaseProfile";
import type {
  FindPasswordFormValues,
  LoginFormValues,
  ResetPasswordFormValues,
  SignupFormValues,
} from "@/entities/user/model/auth.schema";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type {
  AllergyType,
  ExerciseType,
  PreferType,
} from "@/entities/user/model/profile.types";

const EXERCISE_MAP: Record<string, ExerciseType> = {
  cutting: "다이어트 중",
  bulking: "증량 중",
  maintenance: "유지 중",
};

const PREFER_MAP: Record<string, PreferType> = {
  korean: "한식",
  western: "양식",
  chinese: "중식",
  japanese: "일식",
  other: "다른나라",
};

async function fetchAndSetProfile(userId: string, email: string | undefined) {
  try {
    const { profile, prefers, allergies } = await fetchSupabaseProfile();
    useAuthStore.getState().setUser({
      id: userId,
      email: email ?? undefined,
      nickname: profile.nickname ?? "",
      exercise: profile.exercise
        ? (EXERCISE_MAP[profile.exercise] ?? null)
        : null,
      prefer: (prefers as string[])
        .map((p) => PREFER_MAP[p])
        .filter(Boolean) as PreferType[],
      allergy: (
        allergies as unknown as { allergy_min: { allergy: string } | null }[]
      )
        .map((a) => a.allergy_min?.allergy)
        .filter(Boolean) as AllergyType[],
    });
  } catch {
    // profile fetch 실패해도 기본 user 정보는 store에 있음
  }
}

export const useLoginMutation = () => {
  const { login: setLoginState } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginFormValues) => signInWithEmail(data),
    onSuccess: async (data) => {
      const { user, session } = data;
      if (!session) return;

      setLoginState({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: { id: user.id, email: user.email ?? "" },
      });

      await fetchAndSetProfile(user.id, user.email ?? undefined);
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: SignupFormValues) => {
      // OTP 인증 완료 후 비밀번호 설정으로 회원가입 완료
      await updatePassword(data.password);
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: signOutFn,
    onSuccess: () => logout(),
    onError: () => logout(),
  });
};

export const useSendVerificationCodeMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await sendVerificationCodeEmail(email);
      return { message: "인증번호를 전송했습니다.", code: "" };
    },
  });
};

export const useVerifyVerificationCodeMutation = () => {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      await verifyEmailCode(email, code);
      return { message: "이메일 인증이 완료되었습니다." };
    },
  });
};

export const useRequestPasswordResetMutation = () => {
  return useMutation({
    mutationFn: async (data: FindPasswordFormValues) => {
      await requestPasswordResetFn(data.email);
      return { message: "비밀번호 재설정 이메일을 발송했습니다.", token: "" };
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordFormValues & { token: string }) => {
      // Supabase는 URL 해시에서 세션을 자동 복구. token 파라미터 불필요.
      await updatePassword(data.password);
      return "";
    },
  });
};
