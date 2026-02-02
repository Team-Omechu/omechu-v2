"use client";

import { useRouter } from "next/navigation";

import { BasicStateForm } from "@/entities/onboarding";

export default function StateForm() {
  const router = useRouter();
  return <BasicStateForm onCancel={() => router.push("/")} />;
}
