const AUTH_STORAGE_KEY = "auth-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { LoginSuccessData } from "@/entities/user/api/authApi";
import { queryClient } from "@/shared/lib/queryClient";

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
        if (
          version === 0 &&
          persistedState &&
          typeof persistedState === "object"
        ) {
          const { password: _pw, ...rest } = persistedState as Record<
            string,
            unknown
          >;
          return rest as unknown as AuthStoreState;
        }
        return persistedState as AuthStoreState;
      },
    },
  ),
);
