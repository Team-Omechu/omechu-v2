import { StepTransition } from "@/shared";

export default function MypageBasicStateStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StepTransition>{children}</StepTransition>;
}
