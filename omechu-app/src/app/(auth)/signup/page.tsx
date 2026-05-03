"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import {
  MODAL_TO_FORM_FIELD,
  MODAL_TO_TERMS_TYPE,
  type ModalType,
  SignUpForm,
  TermsModal,
} from "@/widgets/auth";

import {
  type ApiClientError,
  type SignupFormValues,
  getAuthErrorMessage,
  signupSchema,
  useSignupMutation,
} from "@/entities/user";

import {
  type TermsConfig,
  type TermsType,
  termsForLocationServiceMain,
  termsForLocationServiceServe,
  termsForPersonalInfoMain,
  termsForPersonalInfoServe,
  termsForServiceMain,
  termsForServiceServe,
} from "@/shared/constants/terms";

import { BottomButton, Header, ModalWrapper, Toast, useToast } from "@/shared";

const TERMS_CONFIG: Record<TermsType, TermsConfig> = {
  service: {
    title: "서비스 이용약관",
    data: [...termsForServiceMain, ...termsForServiceServe],
  },
  "personal-info": {
    title: "개인정보 수집 및 이용 동의",
    data: [...termsForPersonalInfoMain, ...termsForPersonalInfoServe],
  },
  "location-info": {
    title: "위치기반 서비스 이용약관",
    data: [...termsForLocationServiceMain, ...termsForLocationServiceServe],
  },
};

export default function SignupPage() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { show: showToast, message: toastMessage, triggerToast } = useToast();
  const router = useRouter();
  const { mutate: signup, isPending: isSigningUp } = useSignupMutation();

  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
      termsService: false,
      termsPrivacy: false,
      termsLocation: false,
      termsAge: false,
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isValid },
  } = methods;

  const onSubmit = (data: SignupFormValues) => {
    signup(data, {
      onSuccess: () => {
        // 회원가입 성공 → 토큰이 useSignupMutation의 onSuccess에서 자동 저장됨
        // 닉네임/기본상태 미입력 상태이므로 /mypage 진입 시 자동 모달이 열림
        router.push("/mypage");
      },
      onError: (error: unknown) => {
        const e = error as ApiClientError;

        const isDuplicatedEmailLike =
          e?.code === "C006" && e.message === "이미 가입된 이메일입니다.";

        const msg = isDuplicatedEmailLike
          ? "이미 가입된 이메일입니다."
          : getAuthErrorMessage(e?.code, "회원가입에 실패했습니다.");
        triggerToast(msg);
      },
    });
  };

  /** 약관 동의 확인 핸들러 */
  const handleTermsConfirm = () => {
    if (activeModal) {
      const termKey = MODAL_TO_FORM_FIELD[activeModal];
      setValue(termKey, true, { shouldValidate: true });
    }
    setActiveModal(null);
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col">
        {/* 헤더 */}
        <Header />

        {/* 제목 */}
        <div className="px-5 py-5 text-center">
          <h1 className="text-body-2-bold text-font-high">
            회원 정보를 입력해 주세요
          </h1>
        </div>

        {/* 폼 영역 */}
        <main className="flex-1 px-5 pb-16">
          <SignUpForm
            setActiveModalAction={setActiveModal}
            onSubmitAction={handleSubmit(onSubmit)}
          />
        </main>

        {/* 하단 버튼 */}
        <BottomButton
          type="submit"
          form="signup-form"
          disabled={!isValid || isSigningUp}
          className="mx-auto max-w-[480px]"
        >
          {isSigningUp ? "가입하는 중..." : "가입하기"}
        </BottomButton>

        {/* 약관 모달 */}
        {activeModal && (
          <ModalWrapper>
            <TermsModal
              title={TERMS_CONFIG[MODAL_TO_TERMS_TYPE[activeModal]].title}
              terms={TERMS_CONFIG[MODAL_TO_TERMS_TYPE[activeModal]].data}
              onConfirm={handleTermsConfirm}
              onClose={() => setActiveModal(null)}
            />
          </ModalWrapper>
        )}

        <Toast message={toastMessage} show={showToast} className="bottom-20" />
      </div>
    </FormProvider>
  );
}
