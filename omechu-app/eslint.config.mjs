import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import checkFile from "eslint-plugin-check-file";

export default [
  // Base
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "dist/**", ".cache/**"],
  },

  // Prettier: 충돌 룰 비활성화 후 error로 재활성화
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: { "prettier/prettier": "error" },
  },

  // Main
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "check-file": checkFile,
    },
    rules: {
      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // 일반
      eqeqeq: "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 파일명: ts → camelCase 기본
      "check-file/filename-naming-convention": [
        "warn",
        { "**/*.{ts,tsx}": "CAMEL_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
    settings: {
      react: { version: "detect" },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // tsx → PascalCase (Next.js 예약 파일 제외)
  {
    files: ["**/*.tsx"],
    ignores: [
      "**/page.tsx",
      "**/layout.tsx",
      "**/loading.tsx",
      "**/error.tsx",
      "**/not-found.tsx",
      "**/template.tsx",
      "**/default.tsx",
      "**/route.ts",
      "**/use*.tsx",
      "**/index.tsx",
    ],
    rules: {
      "check-file/filename-naming-convention": [
        "warn",
        { "**/*.tsx": "PASCAL_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },

  // FSD: shared → 상위 레이어 import 금지
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/widgets/*", "@/entities/*"],
              message:
                "FSD 위반: shared는 상위 레이어(app, widgets, entities)를 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },

  // FSD: entities → 상위 레이어 import 금지
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/widgets/*"],
              message:
                "FSD 위반: entities는 상위 레이어(app, widgets)를 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },

  // FSD: widgets → app import 금지
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*"],
              message:
                "FSD 위반: widgets는 app 레이어를 import할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
];
