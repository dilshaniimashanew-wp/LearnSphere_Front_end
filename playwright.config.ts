import { defineConfig, devices } from "@playwright/test";

// The tests drive a real browser against a running web app and API (with a seeded database):
//   API:  cd ../LearnSphere_BE && npm run seed:demo -- --reset && npm run dev
//   Web:  npm run dev
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false, // the workflow tests build on each other's data
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  // The API talks to a cloud database, so individual round-trips can occasionally be slow.
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
