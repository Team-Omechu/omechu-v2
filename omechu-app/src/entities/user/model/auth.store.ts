import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ProfileType } from "@/entities/user/model/profile.types";

import { queryClient } from "@/shared/lib/queryClient";

type LoginSuccessData = Partial<ProfileType> & { id: string };

const AUTH_STORAGE_KEY = "auth-storage";

const authStoreStateSchema = z.object({
  isLoggedIn: z.boolean(),
  user: z.looseObject({ id: z.string() }).nullable(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
});

interface AuthStoreState {
  isLoggedIn: boolean;
  user: LoginSuccessData | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthStoreActions {
  login: (data: {
    accessToken: string;
    refreshToken: string;
    user: LoginSuccessData;
  }) => void;
  logout: () => void;
  setUser: (user: LoginSuccessData) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: ({ accessToken, refreshToken, user }) =>
        set({
          isLoggedIn: true,
          accessToken,
          refreshToken,
          user,
        }),
      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
        queryClient.clear();
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem("onboarding-storage");
          localStorage.removeItem("tag-data-storage");
          localStorage.removeItem("recent_search_terms");
        } catch {
          // SSR 환경에서 localStorage 접근 실패 무시
        }
      },
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const candidate =
          version === 0 && persistedState && typeof persistedState === "object"
            ? (() => {
                const { password: _pw, ...rest } = persistedState as Record<
                  string,
                  unknown
                >;
                return rest;
              })()
            : persistedState;

        const parsed = authStoreStateSchema.safeParse(candidate);
        if (parsed.success) {
          return {
            ...parsed.data,
            user: parsed.data.user as LoginSuccessData | null,
          };
        }
        // 형식 불일치 시 로그아웃 상태로 초기화
        return {
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        };
      },
    },
  ),
);
