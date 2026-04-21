"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseToastReturn {
  show: boolean;
  message: string;
  triggerToast: (msg: string, overrideDuration?: number) => void;
}

export interface UseToastOptions {
  duration?: number;
}

/**
 * Toast 메시지를 표시하기 위한 커스텀 훅
 * @param options - duration: Toast 표시 시간 (ms, 기본값: 2500)
 * @returns show, message, triggerToast 함수
 */
export function useToast(options?: UseToastOptions): UseToastReturn {
  const { duration = 2500 } = options || {};
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const toastTimerRef = useRef<number | null>(null);

  const triggerToast = useCallback(
    (msg: string, overrideDuration?: number) => {
      setMessage(msg);
      setShow(true);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setShow(false);
        toastTimerRef.current = null;
      }, overrideDuration ?? duration);
    },
    [duration],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  return { show, message, triggerToast };
}
