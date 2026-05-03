import { StepTransition } from "@/shared";

export default function QuestionAnswerStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StepTransition>{children}</StepTransition>;
}
