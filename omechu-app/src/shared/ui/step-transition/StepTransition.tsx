"use client";

import { usePathname } from "next/navigation";

import { AnimatePresence, m, useReducedMotion } from "motion/react";

type StepTransitionProps = {
  children: React.ReactNode;
};

/**
 * StepTransition
 * - 다단계 flow ([step] dynamic segment)에서 step 간 전환을 부드럽게.
 * - 글로벌 page transition 아님. layout 단위로 명시적으로 감싸 사용.
 * - prefers-reduced-motion 시 transition 비활성.
 */
export function StepTransition({ children }: StepTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -6 }}
        transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-1 flex-col"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
