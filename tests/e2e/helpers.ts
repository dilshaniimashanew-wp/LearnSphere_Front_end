import { expect, type Browser, type Page } from "@playwright/test";

export const DEMO = {
  admin: { email: "admin@learnsphere.test", password: "Admin@12345" },
  instructor: { email: "amara@learnsphere.test", password: "Instructor@12345" },
  student: { email: "nimali@learnsphere.test", password: "Student@12345" },
};

export const PASSWORD = "Passw0rd!";
export const uniqueEmail = (prefix: string) => `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@e2e.test`;

export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function register(page: Page, role: "student" | "instructor", name: string, email: string) {
  await page.goto("/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("I want to").selectOption(role);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(new RegExp(`/${role}$`));
}

/** A fresh browser context (its own cookies), so several users can be signed in at once. */
export async function newUserPage(browser: Browser) {
  const context = await browser.newContext();
  return { page: await context.newPage(), context };
}

/** The app's own alert messages (Next.js also renders an empty role="alert" route announcer). */
export const appAlert = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)');
