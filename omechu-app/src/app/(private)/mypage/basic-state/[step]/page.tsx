import { notFound } from "next/navigation";

import { BasicFoodForm, BasicStateForm } from "@/entities/onboarding";

import { BASIC_STATE_STEPS, type BasicStateStep } from "../steps";
import AllergyForm from "./AllergyForm";

type PageProps = {
  params: Promise<{ step: string }>;
};

function isBasicStateStep(step: string): step is BasicStateStep {
  return (BASIC_STATE_STEPS as readonly string[]).includes(step);
}

export default async function BasicStateStepPage({ params }: PageProps) {
  const { step } = await params;

  if (!isBasicStateStep(step)) notFound();
  return (
    <main>
      {step === "state" && <BasicStateForm cancelHref="/mypage" />}
      {step === "food" && <BasicFoodForm cancelHref="/mypage" />}
      {step === "allergy" && <AllergyForm />}
    </main>
  );
}
