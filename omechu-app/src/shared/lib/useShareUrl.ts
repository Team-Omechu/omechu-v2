"use client";

import { useCallback } from "react";

interface ShareParams {
  title?: string;
  text?: string;
  url?: string;
}

type NavigatorWithShare = Navigator & {
  share?: (data: ShareParams) => Promise<void>;
};

interface UseShareUrlOptions {
  onCopied?: () => void;
  onFailed?: () => void;
}

/**
 * Web Share API → Clipboard API → legacy textarea 순서로 URL/콘텐츠 공유.
 * 각 단계는 환경에서 사용 가능한 경우에만 실행됨.
 */
export function useShareUrl(options?: UseShareUrlOptions) {
  const { onCopied, onFailed } = options ?? {};

  const share = useCallback(
    async (params: ShareParams) => {
      try {
        if (typeof window === "undefined") return;
        const url = params.url ?? window.location.href;
        if (!url) return;

        const nav = window.navigator as NavigatorWithShare;

        if (typeof nav.share === "function") {
          await nav.share({ ...params, url });
          return;
        }

        if (nav.clipboard && typeof nav.clipboard.writeText === "function") {
          await nav.clipboard.writeText(url);
          onCopied?.();
          return;
        }

        // Legacy fallback — document.execCommand deprecated but retained for
        // older browsers without navigator.clipboard.
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand("copy");
        document.body.removeChild(textarea);
        onCopied?.();
      } catch {
        onFailed?.();
      }
    },
    [onCopied, onFailed],
  );

  return { share };
}
