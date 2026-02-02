//! 26.01.13 작업

import { notFound } from "next/navigation";

import {
  TermForLocationInfo,
  TermForPersonalInfo,
  TermForService,
} from "@/widgets/mypage/ui";

import { BASIC_STATE_STEPS, type BasicStateStep } from "./steps";

type PageProps = {
  params: Promise<{ terms: string }>;
};

function isBasicStateStep(step: string): step is BasicStateStep {
  return (BASIC_STATE_STEPS as readonly string[]).includes(step);
}

export default async function BasicStateStepPage({ params }: PageProps) {
  const { terms } = await params;

  if (!isBasicStateStep(terms)) notFound();

  return (
    <main>
      {terms === "service" && <TermForService />}
      {terms === "personal" && <TermForPersonalInfo />}
      {terms === "location" && <TermForLocationInfo />}
    </main>
  );
}
