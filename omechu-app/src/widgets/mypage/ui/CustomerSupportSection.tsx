//! 26.01.12 작업 중
// TODO : onClick 수정

"use client";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import { ArrowIcon } from "@/shared/assets/icons/index";

const LIST_MAP = [
  { listTitle: "계정관리", hyperLink: "/mypage/account-setting" },
  { listTitle: "이메일 문의", hyperLink: "/mypage/email-inquiry" },
  { listTitle: "서비스 이용약관", hyperLink: "/mypage/service" },
  { listTitle: "개인정보 수집 및 이용 동의", hyperLink: "/mypage/personal" },
  { listTitle: "위치 기반 서비스 이용약관", hyperLink: "/mypage/location" },
];
export function CustomerSupportSection() {
  const router = useRouter();

  return (
    <section
      className={clsx(
        "relative flex flex-col gap-2",
        "px-6 py-3",
        "h-fit w-84",
        "bg-background-secondary border-font-placeholder rounded-xl border",
      )}
    >
      <div className="text-body-3-medium text-font-high">고객 지원</div>

      <ul className="my-1 flex flex-col gap-3 pl-0.5">
        {LIST_MAP.map((item) => (
          <li key={item.hyperLink}>
            <button
              type="button"
              onClick={() => router.push(item.hyperLink)}
              className="flex w-full justify-between"
            >
              <div className="text-font-extra-low text-body-4-regular">
                {item.listTitle}
              </div>
              <ArrowIcon
                className="text-font-extra-low"
                width={9}
                height={15}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="text-caption-1-regular text-font-placeholder flex justify-between">
        <div>버전 정보</div>
        <div>v. 5.0.0</div>
      </div>
    </section>
  );
}
