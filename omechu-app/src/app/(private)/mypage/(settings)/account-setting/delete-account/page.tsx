"use client";

import { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import clsx from "clsx";

import {
  withdrawAccount,
  useAuthStore,
  useProfile,
  ApiClientError,
} from "@/entities/user";
import { BaseModal, Button, Header, ModalWrapper, Toast } from "@/shared";
import { CheckIcon } from "@/shared/assets/icons";

const WITHDRAW_REASONS = [
  "선택해 주세요.",
  "자주 사용하지 않아요.",
  "원하는 메뉴/기능이 없어요.",
  "재미 없어요.",
  "기타",
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const logoutAction = useAuthStore((s) => s.logout);

  const [isChecked, setIsChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedReason, setSelectedReason] = useState("선택해 주세요.");
  const [isPending, setIsPending] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nickname = profile?.nickname || "회원";
  const isValidForm = isChecked && selectedReason !== "선택해 주세요.";

  const handleWithdraw = async () => {
    if (!isValidForm || isPending) return;

    setIsPending(true);
    try {
      await withdrawAccount({
        confirmed: true,
        reason: selectedReason,
      });
      setShowModal(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        triggerToast(err.message || "회원 탈퇴에 실패했습니다.");
      } else {
        triggerToast("회원 탈퇴에 실패했습니다.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleModalConfirm = () => {
    logoutAction();
    router.push("/");
  };

  return (
    <>
      <Header
        title="탈퇴하기"
        onBackClick={() => router.push("/mypage/account-setting")}
        showHomeButton={false}
      />

      <main className="relative mt-12 flex h-[80dvh] w-full flex-col items-center px-6">
        <section className="flex w-full flex-col gap-5 px-3">
          <div className="body-3-medium text-font-high">
            {nickname}님, 정말 오메추를 떠나시나요?
          </div>
          <div className="text-body-4-regular text-font-low flex flex-col gap-4.5 whitespace-pre-line">
            <span>
              {`탈퇴하시면 입력하신 개인정보와 메뉴 추천 목록, \n 먹부림 통계 등 모든 활동 정보가 삭제됩니다.`}
            </span>
            <span>
              {`삭제된 데이터는 복구할 수 없으니, 마지막 결정이 \n  맞는지 한 번 더 생각해 주세요.`}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <button
              onClick={() => setIsChecked((prev) => !prev)}
              type="button"
              className={clsx(
                "border-font-high relative h-4.5 w-4.5 rounded-full border",
                isChecked ? "bg-brand-primary" : "bg-font-placeholder",
              )}
            >
              <CheckIcon
                width={18}
                height={18}
                className="absolute -top-px -left-[1.5px]"
                currentColor="#FFFFFF"
              />
            </button>
            <span>안내사항을 모두 확인했습니다.</span>
          </div>
        </section>

        <section className="mt-12 flex w-full flex-col gap-4.5 px-3">
          <div className="body-3-medium text-font-high">
            {nickname}님이 탈퇴하려는 이유가 궁금해요.
          </div>
          <div ref={dropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() => setShowDropDown((v) => !v)}
              className="border-font-disabled bg-background-secondary flex h-10 w-full items-center justify-between rounded-[10px] border px-4 text-left"
            >
              <span
                className={
                  selectedReason === "선택해 주세요."
                    ? "text-font-placeholder"
                    : "text-font-high"
                }
              >
                {selectedReason}
              </span>
            </button>

            {showDropDown && (
              <ul className="border-font-disabled absolute z-50 mt-2 flex h-fit w-full flex-col gap-2 overflow-hidden rounded-[10px] border bg-white p-2.5">
                {WITHDRAW_REASONS.map((reason) => (
                  <li
                    key={reason}
                    onClick={() => {
                      setSelectedReason(reason);
                      setShowDropDown(false);
                    }}
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    {selectedReason === reason ? (
                      <CheckIcon />
                    ) : (
                      <div className="h-5.25 w-5.25" />
                    )}
                    <span
                      className={clsx(
                        "text-caption-1-regular hover:bg-background-secondary w-full",
                        selectedReason === reason
                          ? "text-font-high"
                          : "text-font-placeholder",
                      )}
                    >
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-50 flex gap-2">
          <Button
            width="md"
            bgColor="grey"
            fontColor="black"
            className="border-font-disabled border"
            onClick={() => router.push("/mypage/account-setting")}
          >
            취소
          </Button>
          <Button
            onClick={handleWithdraw}
            width="md"
            disabled={!isValidForm || isPending}
          >
            {isPending ? "처리 중..." : "확인"}
          </Button>
        </section>
      </main>

      {showModal && (
        <ModalWrapper>
          <BaseModal
            title="계정 탈퇴가 완료되었습니다"
            rightButtonText="확인"
            isCloseButtonShow={false}
            onRightButtonClick={handleModalConfirm}
          />
        </ModalWrapper>
      )}

      <Toast
        message={toastMessage}
        state="error"
        show={showToast}
        className="bottom-44"
      />
    </>
  );
}
