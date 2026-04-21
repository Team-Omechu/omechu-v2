"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiClientError, submitInquiry } from "@/entities/user";

import { Toast } from "@/shared/ui/toast/Toast";

import { Button, FormField, Header, Input } from "@/shared";

export default function EmailInquiryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastState, setToastState] = useState<"success" | "error">("success");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content || isPending) return;

    setIsPending(true);

    try {
      await submitInquiry({ title, content });

      setToastMessage("문의가 정상적으로 접수되었습니다.");
      setToastState("success");
      setShowToast(true);
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "문의 접수에 실패했습니다. 다시 시도해주세요.";

      setToastMessage(message);
      setToastState("error");
      setShowToast(true);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (!showToast) return;

    const timer = setTimeout(() => {
      setShowToast(false);
      if (toastState === "success") {
        router.back();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showToast, toastState, router]);

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
        <FormField label={"문의 내용"} id="inquiry-content" className="-mt-2">
          <textarea
            required
            id="inquiry-content"
            placeholder="궁금한 점이나 개선 의견을 자유롭게 남겨주세요."
            className="bg-brand-secondary text-body-4-regular placeholder:text-font-placeholder border-font-placeholder h-42.5 w-83.5 rounded-[10px] border p-3 outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>
        <Button
          disabled={!title || !content || isPending}
          onClick={handleSubmit}
        >
          {isPending ? "접수 중..." : "접수하기"}
        </Button>

        <section className="text-font-extra-low bg-brand-tertiary text-caption-1-medium flex h-20 w-83.5 items-center justify-center rounded-[10px] whitespace-pre-line">
          {`접수하신 문의는 운영자 메일로 전송됩니다. \n 순차적으로 확인 후 최대한 빠르게 이메일로 \n 답장드리겠습니다.`}
        </section>
      </main>

      <Toast
        message={toastMessage}
        state={toastState}
        show={showToast}
        className="bottom-10"
      />
    </>
  );
}
