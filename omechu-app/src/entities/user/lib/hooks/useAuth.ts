import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/entities/user/api/authApi";
import type {
  LoginFormValues,
  SignupFormValues,
  FindPasswordFormValues,
  ResetPasswordFormValues,
} from "@/entities/user/model/auth.schema";
import { useAuthStore } from "@/entities/user/model/auth.store";
import axiosInstance from "@/shared/lib/axiosInstance";

// 로그인
export const useLoginMutation = () => {
  const { login: setLoginState } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<authApi.LoginTokens, Error, LoginFormValues>({
    mutationFn: authApi.login,
    onSuccess: async (tokens, variables) => {
      // 1) 토큰 보관 (로그인 직후는 프로필 정보 없음 - prefetch로 채움)
      const tempUser = {
        id: tokens.userId,
        email: tokens.email ?? variables.email,
      };

      setLoginState({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: tempUser,
      });

      // 2) axios 인스턴스에 Authorization 주입 (중복 401 방지)
      if (tokens?.accessToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;
      }

      try {
        const profile = await queryClient.fetchQuery({
          queryKey: ["user", "profile"],
          queryFn: authApi.getCurrentUser,
          staleTime: 1000 * 60 * 10,
        });
        const currentEmail = useAuthStore.getState().user?.email;
        useAuthStore.getState().setUser({
          ...profile,
          email: profile.email ?? currentEmail,
        });
      } catch (err) {
        console.warn(
          "[Auth] 프로필 prefetch 실패:",
          err instanceof Error ? err.message : String(err),
        );
      }
    },
    onError: (error) => {
      console.error("[Auth] 로그인 실패:", error.message);
    },
  });
};

// 회원가입
export const useSignupMutation = () => {
  const { login: setLoginState } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<authApi.SignupSuccessData, Error, SignupFormValues>({
    mutationFn: authApi.signup,
    onSuccess: async (data) => {
      const newUser = {
        id: data.id,
        email: data.email,
      };

      setLoginState({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: newUser,
      });

      if (data?.accessToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      }

      try {
        const profile = await queryClient.fetchQuery({
          queryKey: ["user", "profile"],
          queryFn: authApi.getCurrentUser,
          staleTime: 1000 * 60 * 10,
        });
        const currentEmail = useAuthStore.getState().user?.email;
        useAuthStore.getState().setUser({
          ...profile,
          email: profile.email ?? currentEmail,
        });
      } catch (err) {
        console.warn(
          "[Auth] 회원가입 후 프로필 prefetch 실패:",
          err instanceof Error ? err.message : String(err),
        );
      }
    },
    onError: (error) => {
      console.error("[Auth] 회원가입 실패:", error.message);
    },
  });
};

// 로그아웃
export const useLogoutMutation = () => {
  return useMutation<void, Error>({
    mutationFn: authApi.logout,
  });
};

// 이메일 인증코드 전송
export const useSendVerificationCodeMutation = () => {
  return useMutation<authApi.SendVerificationCodeSuccessData, Error, string>({
    mutationFn: (email) => authApi.sendVerificationCode(email),
  });
};

// 이메일 인증코드 검증
export const useVerifyVerificationCodeMutation = () => {
  return useMutation<
    authApi.VerifyVerificationCodeSuccessData,
    Error,
    { email: string; code: string }
  >({
    mutationFn: (data) => authApi.verifyVerificationCode(data),
  });
};

// 비밀번호 재설정 요청
export const useRequestPasswordResetMutation = () => {
  return useMutation<
    authApi.RequestPasswordResetSuccessData,
    Error,
    FindPasswordFormValues
  >({
    mutationFn: authApi.requestPasswordReset,
  });
};

// 비밀번호 재설정
export const useResetPasswordMutation = () => {
  return useMutation<
    string,
    Error,
    ResetPasswordFormValues & { token: string }
  >({
    mutationFn: authApi.resetPassword,
  });
};
