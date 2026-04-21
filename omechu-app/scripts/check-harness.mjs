import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(appDir, "..");

const requiredFiles = [
  path.join(repoDir, "AGENTS.md"),
  path.join(repoDir, "CLAUDE.md"),
  path.join(repoDir, "docs", "HARNESS_ENGINEERING.md"),
  path.join(repoDir, "supabase", "README.md"),
  path.join(appDir, ".env.test"),
  path.join(appDir, "vitest.config.ts"),
  path.join(appDir, "playwright.config.ts"),
  path.join(appDir, "scripts", "check-harness.mjs"),
];

async function assertExists(filePath) {
  try {
    await access(filePath);
  } catch {
    throw new Error(
      `Missing harness file: ${path.relative(repoDir, filePath)}`,
    );
  }
}

async function main() {
  await Promise.all(requiredFiles.map(assertExists));

  const [claudeMd, packageJson, ciWorkflow] = await Promise.all([
    readFile(path.join(repoDir, "CLAUDE.md"), "utf8"),
    readFile(path.join(appDir, "package.json"), "utf8"),
    readFile(path.join(repoDir, ".github", "workflows", "ci.yml"), "utf8"),
  ]);

  if (!claudeMd.includes("@AGENTS.md")) {
    throw new Error("CLAUDE.md must include @AGENTS.md.");
  }

  const pkg = JSON.parse(packageJson);
  const requiredScripts = [
    "harness:check",
    "test:unit",
    "test:e2e",
    "validate:ci",
  ];

  for (const scriptName of requiredScripts) {
    if (!pkg.scripts?.[scriptName]) {
      throw new Error(`Missing package.json script: ${scriptName}`);
    }
  }

  const requiredCiSteps = [
    "pnpm validate:ci",
    "pnpm exec playwright install --with-deps chromium",
    "pnpm test:e2e",
  ];

  for (const step of requiredCiSteps) {
    if (!ciWorkflow.includes(step)) {
      throw new Error(`CI workflow must include: ${step}`);
    }
  }

  console.log("Harness check passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
