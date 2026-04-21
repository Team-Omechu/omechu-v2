import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:4010",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3001",
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "test-google-maps-key",
      GOOGLE_MAP_SERVER_API_KEY: "test-google-map-server-key",
      NEXT_PUBLIC_EMBED_API_URL: "https://embed.example.com",
      NEXT_PUBLIC_SENTRY_DSN: "",
      SENTRY_AUTH_TOKEN: "",
      SENTRY_ORG: "omechu",
      SENTRY_PROJECT: "omechu-fe",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
