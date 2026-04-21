"use client";

import React from "react";

import { useFormContext } from "react-hook-form";

import type { SignupFormValues } from "@/entities/user";

import { CheckBox } from "@/shared";

import type { ModalType } from "../types";

type TermsAgreementProps = {
  setActiveModal: (modal: ModalType | null) => void;
};

const TermsAgreement = ({ setActiveModal }: TermsAgreementProps) => {
  const { register, setValue, watch } = useFormContext<SignupFormValues>();

  const termNames = [
    "termsService",
    "termsPrivacy",
    "termsLocation",
    "termsAge",
  ] as const;

  // '전체 동의' 상태를 useEffect나 useState 없이 직접 계산합니다.
  // 이것이 바로 "완벽하고 확실한" 로직입니다.
  const isAllAgreed = watch(termNames).every(Boolean);

  const handleAllAgreement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    termNames.forEach((name) => {
      setValue(name, checked, { shouldValidate: true });
    });
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {/* 제목 */}
      <h2 className="text-body-4-medium text-font-high text-center">
        서비스 약관에 동의해 주세요
      </h2>

      {/* 전체 동의 */}
      <CheckBox
        id="all"
        label={
          <span className="text-caption-1-regular text-font-high">
            아래의 내용을 모두 확인하였으며 모두 동의합니다
          </span>
        }
        checked={isAllAgreed}
        onChange={handleAllAgreement}
        variant="round"
      />

      {/* 개별 약관 */}
      <div className="ml-4 flex flex-col gap-3">
        {/* 서비스 이용약관 */}
        <div className="flex items-center justify-between">
          <CheckBox
            id="termsService"
            label={
              <span className="text-caption-1-regular text-font-high">
                서비스 이용약관 동의(필수)
              </span>
            }
            {...register("termsService")}
            variant="round"
          />
          <button
            type="button"
            onClick={() => setActiveModal("service")}
            className="text-caption-2-regular text-font-extra-low"
          >
            보기
          </button>
        </div>

        {/* 개인정보 처리방침 */}
        <div className="flex items-center justify-between">
          <CheckBox
            id="termsPrivacy"
            label={
              <span className="text-caption-1-regular text-font-high">
                개인정보 수집 및 이용 동의(필수)
              </span>
            }
            {...register("termsPrivacy")}
            variant="round"
          />
          <button
            type="button"
            onClick={() => setActiveModal("privacy")}
            className="text-caption-2-regular text-font-extra-low"
          >
            보기
          </button>
        </div>

        {/* 위치 기반 서비스 */}
        <div className="flex items-center justify-between">
          <CheckBox
            id="termsLocation"
            label={
              <span className="text-caption-1-regular text-font-high">
                위치 기반 서비스 이용약관 동의(선택)
              </span>
            }
            {...register("termsLocation")}
            variant="round"
          />
          <button
            type="button"
            onClick={() => setActiveModal("location")}
            className="text-caption-2-regular text-font-extra-low"
          >
            보기
          </button>
        </div>

        {/* 만 14세 이상 */}
        <CheckBox
          id="termsAge"
          label={
            <span className="text-caption-1-regular text-font-high">
              본인은 만 14세 이상입니다. (필수)
            </span>
          }
          {...register("termsAge")}
          variant="round"
        />
      </div>
    </div>
  );
};

export default TermsAgreement;
