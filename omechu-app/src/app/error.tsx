"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-[375px] space-y-4 text-center">
        <h1 className="text-font-high text-2xl font-bold">
          문제가 발생했습니다
        </h1>
        <p className="text-font-low text-sm">
          예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-brand-primary rounded-xl px-6 py-3 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
