//! 26.01.13 작업

import { notFound } from "next/navigation";

import AllergyForm from "./AllergyForm";
import FoodForm from "./FoodForm";
import StateForm from "./StateForm";
import { BASIC_STATE_STEPS, type BasicStateStep } from "../steps";

type PageProps = {
  params: { step: string };
};

function isBasicStateStep(step: string): step is BasicStateStep {
  return (BASIC_STATE_STEPS as readonly string[]).includes(step);
}

export default async function BasicStateStepPage({ params }: PageProps) {
  const { step } = await params;

  if (!isBasicStateStep(step)) notFound();
  return (
    <main>
      {step === "state" && <StateForm />}
      {step === "food" && <FoodForm />}
      {step === "allergy" && <AllergyForm />}
    </main>
  );
}
