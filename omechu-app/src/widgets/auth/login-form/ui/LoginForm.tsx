"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  type ApiClientError,
  type LoginFormValues,
  getAuthErrorMessage,
  loginSchema,
  useAuthStore,
  useLoginMutation,
} from "@/entities/user";

import { Button, CheckBox, FormField, Input, Toast, useToast } from "@/shared";

/**
 * LoginForm (Legacy)
 * - 이메일/비밀번호 로그인 폼
 * - 새로운 로그인 페이지는 /login/email/page.tsx 사용 권장
 */
export default function LoginForm() {
  const { show: showToast, message: toastMessage, triggerToast } = useToast();
  const navigatedRef = useRef(false);
  const justLoggedInRef = useRef(false);

  const router = useRouter();

  const { mutate: login, isPending, isSuccess } = useLoginMutation();

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

  useEffect(() => {
    return () => {
      justLoggedInRef.current = false;
      navigatedRef.current = false;
    };
  }, []);

  const onSubmit = useCallback(
    (data: LoginFormValues) => {
      login(data, {
        onSuccess: () => {
          // useLoginMutation 내부에서 이미 프로필 fetch + setUser 완료
          justLoggedInRef.current = true;
        },
        onError: (err) => {
          const e = err as ApiClientError & { code?: string; status?: number };
          const msg =
            e?.message ||
            getAuthErrorMessage(e?.code, "로그인에 실패했습니다.");
          triggerToast(msg);
        },
      });
    },
    [login, triggerToast],
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
