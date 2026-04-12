/** @type {import("prettier").Config} */
const config = {
  singleQuote: false,
  semi: true,
  useTabs: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  arrowParens: "always",
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  // import 자동 정렬 (FSD 레이어 순서)
  importOrder: [
    "^(react/(.*)$)|^(react$)|^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@/app/(.*)$",
    "^@/widgets/(.*)$",
    "^@/entities/(.*)$",
    "^@/shared/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
