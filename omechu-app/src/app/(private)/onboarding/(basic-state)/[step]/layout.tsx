import { StepTransition } from "@/shared";

export default function OnboardingStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StepTransition>{children}</StepTransition>;
}
