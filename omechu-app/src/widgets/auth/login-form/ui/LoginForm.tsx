"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

import { ApiClientError } from "@/entities/user/api/authApi";
import { fetchProfile } from "@/entities/user/api/profileApi";
import { useLoginMutation } from "@/entities/user/lib/hooks/useAuth";
import {
  loginSchema,
  LoginFormValues,
} from "@/entities/user/model/auth.schema";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { CheckBox, Toast, Button, FormField, Input } from "@/shared";

/**
 * LoginForm (Legacy)
 * - 이메일/비밀번호 로그인 폼
 * - 새로운 로그인 페이지는 /login/email/page.tsx 사용 권장
 */
export default function LoginForm() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);
  const justLoggedInRef = useRef(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: login, isPending, isSuccess, error } = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setShowToast(false);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      justLoggedInRef.current = false;
      navigatedRef.current = false;
    };
  }, []);

  const onSubmit = useCallback(
    (data: LoginFormValues) => {
      login(data, {
        onSuccess: async () => {
          try {
            await queryClient.prefetchQuery({
              queryKey: ["user", "profile"],
              queryFn: fetchProfile,
            });
            justLoggedInRef.current = true;
          } catch (e) {
            console.warn("[Login] prefetch profile failed", e);
          }
        },
      });
    },
    [login, queryClient],
  );

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (navigatedRef.current) return;
    if (!justLoggedInRef.current) return;
    if (!isSuccess || !user?.id) return;

    navigatedRef.current = true;
    if (user.nickname && user.nickname.trim().length > 0) {
      router.push("/mainpage");
    } else {
      router.push("/onboarding");
    }
  }, [isSuccess, user, router]);

  useEffect(() => {
    if (!error) return;
    const e = error as ApiClientError & { code?: string; status?: number };
    const code = e?.code;
    let msg: string | null = e?.message || null;

    if (!msg) {
      switch (code) {
        case "C001":
          msg = "이메일 또는 비밀번호를 입력해 주세요.";
          break;
        case "C003":
          msg = "로그인이 필요합니다. 다시 시도해 주세요.";
          break;
        case "S001":
          msg = "세션이 만료되었어요. 다시 로그인해 주세요.";
          break;
        case "T002":
        case "T003":
          msg = "인증에 문제가 발생했어요. 다시 로그인해 주세요.";
          break;
        default:
          msg = null;
      }
    }
    triggerToast(msg || "로그인에 실패했습니다.");
  }, [error, triggerToast]);

  // eslint-disable-next-line react-hooks/refs -- handleSubmit is from react-hook-form
  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <>
      <form onSubmit={handleFormSubmit} className="flex w-full flex-col gap-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormField
              label="이메일"
              id="signin-email"
              helperText={errors.email?.message}
              helperState={errors.email ? "error" : undefined}
            >
              <Input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                width="default"
                className="w-full"
              />
            </FormField>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormField
              label="비밀번호"
              id="signin-password"
              helperText={errors.password?.message}
              helperState={errors.password ? "error" : undefined}
            >
              <Input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                width="default"
                className="w-full"
              />
            </FormField>
          )}
        />

        <div className="mt-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </div>

        <div className="text-grey-normal-active mt-2 flex items-center justify-between text-sm">
          <CheckBox
            id="remember-me"
            label="로그인 상태 유지"
            {...register("rememberMe")}
          />
          <div className="flex items-center gap-2">
            <Link href="/forgot-password" className="hover:underline">
              비밀번호 찾기
            </Link>
            <span className="text-grey-normal-active">|</span>
            <Link href="/signup" className="hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </form>

      <Toast message={toastMessage} show={showToast} className="bottom-20" />
    </>
  );
}
