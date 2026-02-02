"use client";

import { useRouter } from "next/navigation";

import { BasicFoodForm } from "@/entities/onboarding";

export default function FoodForm() {
  const router = useRouter();
  return <BasicFoodForm onCancel={() => router.push("/mypage")} />;
}
