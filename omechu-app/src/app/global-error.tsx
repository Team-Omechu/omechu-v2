"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="ko">
      <body>
        <div className="flex min-h-dvh items-center justify-center px-6">
          <div className="w-full max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
            <p className="text-sm text-gray-600">
              예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
