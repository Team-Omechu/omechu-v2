"use client";

import { useEffect } from "react";

import { m } from "motion/react";

import { lockBodyScroll, unlockBodyScroll } from "@/shared/lib/bodyScrollLock";
import { cn } from "@/shared/lib/cn";

type ModalWrapperProps = {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export function ModalWrapper({
  children,
  className,
  onClose,
}: ModalWrapperProps) {
  useEffect(() => {
    lockBodyScroll();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockBodyScroll();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        className,
      )}
    >
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </m.div>
    </div>
  );
}
