"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button, FormField, Header, Input } from "@/shared";
import { Toast } from "@/shared/ui/toast/Toast";

export default function EmailInquiryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    if (!title || !content) return;

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      router.back();
    }, 3000);
  };

  return (
    <>
      <Header
        title="이메일 문의"
        onBackClick={() => router.push("/mypage")}
        showHomeButton={false}
      />

      <main className="relative mt-10 flex h-[80dvh] w-full flex-col items-center justify-start gap-6 px-5">
        <FormField label={"문의제목"} id={"title"}>
          <Input
            required
            id={"title"}
            width="default"
            placeholder={"어떤 내용인지 한 줄로 알려주세요."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>
        <FormField label={"문의 내용"} id={""} className="-mt-2">
          <textarea
            required
            placeholder="궁금한 점이나 개선 의견을 자유롭게 남겨주세요."
            className="bg-brand-secondary text-body-4-regular placeholder:text-font-placeholder border-font-placeholder h-42.5 w-83.5 rounded-[10px] border p-3 outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>
        <Button disabled={!title || !content} onClick={handleSubmit}>
          접수하기
        </Button>

        <section className="text-font-extra-low bg-brand-tertiary text-caption-1-medium flex h-20 w-83.5 items-center justify-center rounded-[10px] whitespace-pre-line">
          {`접수하신 문의는 운영자 메일로 전송됩니다. \n 순차적으로 확인 후 최대한 빠르게 이메일로 \n 답장드리겠습니다.`}
        </section>
      </main>

      <Toast
        message={"문의가 정상적으로 접수되었습니다."}
        state="success"
        show={showToast}
        className="bottom-10"
      />
    </>
  );
}
