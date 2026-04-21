import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import checkFile from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Base
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      ".cache/**",
      "next-env.d.ts",
      "instrumentation-client.ts",
      "instrumentation.ts",
      "sentry.*.config.ts",
    ],
  },

  // Node scripts: console/process 등 node globals 허용
  {
    files: ["scripts/**/*.{js,mjs,cjs}", "*.config.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: { ...globals.node },
    },
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
      "jsx-a11y": jsxA11y,
      "check-file": checkFile,
      import: importPlugin,
      "unused-imports": unusedImports,
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
      // React 19 실험적 규칙 — 외부 데이터/라이브러리 패턴과 충돌 처리
      //
      // set-state-in-effect: off
      //   → 현재 수동 페이지네이션 + react-query 결과 누적 패턴에서 불가피.
      //     해결책은 useInfiniteQuery/useQuery select 전환이며 별도 refactor 필요.
      //     자세한 사유: docs/CONVENTIONS.md 참고.
      "react-hooks/set-state-in-effect": "off",
      // refs: warn
      //   → react-hook-form handleSubmit 은 internal ref 읽기가 설계상 필수.
      //     실제 위반 위치엔 개별 eslint-disable-next-line + 사유 주석 사용.
      "react-hooks/refs": "warn",
      // incompatible-library: warn
      //   → react-hook-form 등 외부 라이브러리 호환 경고. useWatch/useController 등
      //     공식 대안 사용 시 자동 해결. 잔존 케이스는 점진적 마이그레이션 대상.
      "react-hooks/incompatible-library": "warn",

      // jsx-a11y (접근성) — recommended 전체 활성화
      ...jsxA11y.configs.recommended.rules,
      // ARIA authoring practices: ul/li에 listbox/option 역할 허용
      "jsx-a11y/no-noninteractive-element-to-interactive-role": [
        "error",
        {
          ul: [
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "tablist",
            "tree",
            "treegrid",
          ],
          ol: [
            "listbox",
            "menu",
            "menubar",
            "radiogroup",
            "tablist",
            "tree",
            "treegrid",
          ],
          li: [
            "option",
            "menuitem",
            "menuitemradio",
            "menuitemcheckbox",
            "tab",
            "treeitem",
          ],
          table: ["grid"],
          td: ["gridcell"],
        },
      ],

      // unused-imports (자동 제거)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // import 품질
      "import/no-cycle": ["error", { maxDepth: 10 }],
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "warn",

      // 일반
      eqeqeq: "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 파일명: ts → camelCase 기본 (Next.js 예약 파일 제외)
      "check-file/filename-naming-convention": [
        "warn",
        {
          "**/!(page|layout|loading|error|not-found|template|default|global-error|route|sitemap|robots|manifest|opengraph-image|twitter-image|icon|apple-icon|instrumentation*|middleware|sentry.*.config).{ts,tsx}":
            "CAMEL_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],

      // 폴더명: widgets/entities 슬라이스는 kebab-case 강제
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/widgets/*/": "KEBAB_CASE",
          "src/entities/*/": "KEBAB_CASE",
        },
      ],
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: true,
      },
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
      "**/global-error.tsx",
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

  // FSD: widgets → app import 금지 + 다른 widgets/entities 슬라이스 내부 deep import 금지
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*"],
              message: "FSD 위반: widgets는 app 레이어를 import할 수 없습니다.",
            },
            {
              group: ["@/widgets/*/*", "@/widgets/*/*/**"],
              message:
                "FSD 위반: 다른 widgets 슬라이스 내부 경로 접근 금지. 해당 슬라이스의 index.ts(Public API)만 사용하세요.",
            },
            {
              group: ["@/entities/*/*", "@/entities/*/*/**"],
              message:
                "FSD 위반: entities 슬라이스 내부 경로 접근 금지. @/entities/{slice}의 index.ts(Public API)만 사용하세요.",
            },
          ],
        },
      ],
    },
  },

  // FSD: app → widgets/entities 슬라이스 내부 deep import 금지 (Public API 강제)
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/widgets/*/*", "@/widgets/*/*/**"],
              message:
                "FSD 위반: widgets 슬라이스 내부 경로 접근 금지. @/widgets/{slice}의 index.ts(Public API)만 사용하세요.",
            },
            {
              group: ["@/entities/*/*", "@/entities/*/*/**"],
              message:
                "FSD 위반: entities 슬라이스 내부 경로 접근 금지. @/entities/{slice}의 index.ts(Public API)만 사용하세요.",
            },
          ],
        },
      ],
    },
  },
];
