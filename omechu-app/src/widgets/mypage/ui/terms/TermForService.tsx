"use client";

import { useRouter } from "next/navigation";

import {
  termsForServiceMain,
  termsForServiceServe,
} from "@/shared/constants/terms";

import { Header } from "@/shared";

export function TermForService() {
  const router = useRouter();
  return (
    <>
      <Header
        title="서비스 이용 약관"
        onBackClick={() => router.push("/mypage")}
        showHomeButton={false}
      />
      <main className="mt-6 mb-10 h-full w-full px-7.5">
        {termsForServiceMain.map((item) => (
          <div key={item.index} className="">
            <span className="flex gap-0.5">
              <span>제</span>
              <span>{item.index}</span>
              <span>조</span>
              <span>({item.about})</span>
            </span>
            <div className="text-body-4-medium text-font-extra-low mb-4 px-2 leading-6 whitespace-pre-line">
              {item.content}
            </div>
          </div>
        ))}
        {termsForServiceServe.map((item) => (
          <div key={item.index} className="">
            {item.index && (
              <span className="flex gap-0.5">
                <span>제</span>
                <span>{item.index}</span>
                <span>조</span>
                <span>({item.about})</span>
              </span>
            )}
            {item.index ? (
              <div className="text-body-4-medium text-font-extra-low mb-4 px-2 leading-6 whitespace-pre-line">
                {item.content}
              </div>
            ) : (
              <div className="text-font-high text-body-3-bold mb-1">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </main>
    </>
  );
}
