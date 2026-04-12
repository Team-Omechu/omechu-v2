/** @type {import('lint-staged').Config} */
export default {
  "**/*.{js,jsx,ts,tsx,mjs}": [
    "eslint --fix",
    "prettier --write",
    () => "tsc --noEmit --pretty false",
  ],
  "**/*.{json,md,css}": ["prettier --write"],
};
