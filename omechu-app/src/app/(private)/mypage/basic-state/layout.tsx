"use client";

import { useEffect } from "react";

import { useOnboardingStore } from "@/entities/onboarding/model/onboarding.store";
import { useProfile } from "@/entities/user";

export default function BasicStateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useProfile();
  const hydrateFromProfile = useOnboardingStore(
    (state) => state.hydrateFromProfile,
  );

  useEffect(() => {
    if (profile) {
      hydrateFromProfile(profile);
    }
  }, [profile, hydrateFromProfile]);

  return <>{children}</>;
}
