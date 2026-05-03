"use client";

import type { ModalType } from "../signUpForm.types";
import TermsAgreement from "./TermsAgreement";
import UserInfoFields from "./UserInfoFields";

type SignUpFormProps = {
  setActiveModalAction: (modal: ModalType | null) => void;
  onSubmitAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export default function SignUpForm({
  setActiveModalAction,
  onSubmitAction,
}: SignUpFormProps) {
  return (
    <form
      id="signup-form"
      onSubmit={onSubmitAction}
      className="mx-auto flex w-full flex-col gap-6"
    >
      <UserInfoFields />

      {/* 구분선 */}
      <hr className="border-font-placeholder border-t" />

      <TermsAgreement setActiveModalAction={setActiveModalAction} />
    </form>
  );
}
