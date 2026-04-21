"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/entities/user";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const sb = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") return;

      if (session) {
        useAuthStore.getState().login({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: { id: session.user.id, email: session.user.email ?? "" },
        });
      } else {
        useAuthStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
