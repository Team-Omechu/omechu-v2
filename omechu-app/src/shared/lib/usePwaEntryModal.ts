"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "pwa:onboardingModalSeen";
const CONSENT_KEY = "pwa:marketingConsent";

// 온보딩 완료 후 홈으로 이동할 때만 심어둘 플래그
const TRIGGER_KEY = "pwa:triggerFromOnboarding";

type Consent = "unset" | "granted" | "denied";

export function usePwaEntryModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    //온보딩에서 온 경우에만 띄움
    const triggered = window.sessionStorage.getItem(TRIGGER_KEY);
    if (triggered !== "1") return;

    //트리거는 1회성(홈에서 확인했으면 바로 제거)
    window.sessionStorage.removeItem(TRIGGER_KEY);

    //이미 본 적 있으면 더 이상 안 띄움 (영구 1회)
    const seen = window.localStorage.getItem(SEEN_KEY);
    if (seen !== "1") setOpen(true);
  }, []);

  const closeAs = (consent: Consent) => {
    window.localStorage.setItem(SEEN_KEY, "1");
    window.localStorage.setItem(CONSENT_KEY, consent);
    setOpen(false);
  };

  const skip = () => closeAs("denied");
  const agree = () => closeAs("granted");

  return { open, setOpen, skip, agree };
}
