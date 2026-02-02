//! 26.01.13 작업

"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/entities/onboarding";
import { OnboardingCharacterIcon } from "@/shared/assets/icons/onboarding/OnboardingCharacterIcon";
import { BottomButton, FormField, Input } from "@/shared/index";

export default function OnboardingStartForm() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");

  const nicknameRegex = /^[A-Za-z가-힣]{2,12}$/;
  const isValidNickname = nicknameRegex.test(nickname);

  return (
    <>
      <section className="mt-50 flex h-fit flex-col items-center px-10">
        <OnboardingCharacterIcon className="h-32 w-27" />
        <div className="text-body-2-bold mt-5 flex flex-col">
          <h1 className="text-statelayer-default">반가워요!</h1>
          <span className="text-font-high">어떻게 불러드릴까요?</span>
        </div>
        <FormField
          label={"닉네임"}
          id={""}
          helperText={"* 한영문자 2-12자로 입력해 주세요"}
          className="mt-8"
        >
          <Input
            width="xs"
            placeholder="닉네임을 입력해주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </FormField>
      </section>
      <BottomButton
        disabled={!isValidNickname}
        onClick={() => {
          if (!isValidNickname) return;
          useOnboardingStore.getState().setNickname(nickname);
          router.push("/onboarding/state");
        }}
      >
        다음
      </BottomButton>
    </>
  );
}
