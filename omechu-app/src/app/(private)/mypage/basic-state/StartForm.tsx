//! 26.01.13 작업

"use client";

import { useRouter } from "next/navigation";

import { Button, Header } from "@/shared/index";

export default function StartForm() {
  const router = useRouter();

  return (
    <>
      <Header onBackClick={() => router.back()} />
      <section className="mt-30 flex h-[40dvh] flex-col items-center px-10">
        <h1 className="text-foundation-grey-darker text-body-2-bold">
          기본 상태 입력하기
        </h1>
        <span className="text-body-4-regular text-font-placeholder mt-4 text-center leading-tight whitespace-pre-line">
          {`기본 상태를 저장해 \n 더 정교한 메뉴 추천을 받아 보세요!`}
        </span>
        <Button
          width={"sm"}
          className="mt-20"
          onClick={() => router.push("basic-state/state")}
        >
          시작하기
        </Button>
      </section>
    </>
  );
}
