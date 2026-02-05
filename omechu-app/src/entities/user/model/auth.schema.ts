import { z } from "zod";

// 로그인 폼 검증 스키마
export const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  rememberMe: z.boolean().optional(),
});

// 스키마로부터 TypeScript 타입 추론
export type LoginFormValues = z.infer<typeof loginSchema>;

// 회원가입 폼 검증 스키마
export const signupSchema = z
  .object({
    email: z.string().email({ message: "이메일 형식이 올바르지 않습니다." }),
    verificationCode: z.string().optional(),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "* 영문 대소문자, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.",
      ),
    passwordConfirm: z.string().min(1, "* 비밀번호가 일치하지 않습니다"),
    termsService: z.boolean().refine((val) => val === true, {
      message: "서비스 이용약관에 동의해주세요.",
    }),
    termsPrivacy: z.boolean().refine((val) => val === true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
    termsLocation: z.boolean(),
    termsAge: z.boolean().refine((val) => val === true, {
      message: "만 14세 이상임에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// 비밀번호 찾기 폼 검증 스키마
export const findPasswordSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
});

export type FindPasswordFormValues = z.infer<typeof findPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "8자 이상의 비밀번호를 입력해주세요.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "영문 대소문자, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.",
      ),
    passwordConfirm: z.string().min(1, "비밀번호를 다시 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
