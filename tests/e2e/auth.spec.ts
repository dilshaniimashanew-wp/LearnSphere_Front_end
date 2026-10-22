import { expect, test } from "@playwright/test";
import { DEMO, PASSWORD, register, signIn, uniqueEmail } from "./helpers";

test.describe("authentication and route protection", () => {
  test("shows field errors, then a server error for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();

    await signIn(page, DEMO.student.email, "WrongPassword1");
    await expect(page.getByRole("alert")).toContainText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
  });

  test("sends signed-out visitors to the login page and back after signing in", async ({ page }) => {
    await page.goto("/student/grades");
    await expect(page).toHaveURL(/\/login\?next=%2Fstudent%2Fgrades/);
    await page.getByLabel("Email").fill(DEMO.student.email);
    await page.getByLabel("Password").fill(DEMO.student.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/student\/grades$/);
  });

  test("keeps the session across a reload and ends it on sign out", async ({ page }) => {
    await signIn(page, DEMO.student.email, DEMO.student.password);
    await expect(page).toHaveURL(/\/student$/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/student");
    await expect(page).toHaveURL(/\/login/);
  });

  test("keeps each role inside its own area", async ({ page }) => {
    await signIn(page, DEMO.student.email, DEMO.student.password);
    await expect(page).toHaveURL(/\/student$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/student$/);
    await page.goto("/instructor/courses");
    await expect(page).toHaveURL(/\/student$/);
  });

  test("each role lands on its own dashboard", async ({ page }) => {
    for (const [role, creds] of Object.entries(DEMO)) {
      await signIn(page, creds.email, creds.password);
      await expect(page).toHaveURL(new RegExp(`/${role}$`));
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL("/");
    }
  });

  test("registration validates the password policy and prevents duplicates", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Weak Password");
    await page.getByLabel("Email").fill(uniqueEmail("weak"));
    await page.getByLabel("Password", { exact: true }).fill("abc");
    await page.getByLabel("Confirm password").fill("abd");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page.getByText("Passwords do not match")).toBeVisible();

    const email = uniqueEmail("dupe");
    await register(page, "student", "First Account", email);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Second Account");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("alert")).toContainText("already exists");
  });

  test("the public registration form only offers student and instructor", async ({ page }) => {
    await page.goto("/register");
    const options = await page.getByLabel("I want to").locator("option").allInnerTexts();
    expect(options.join(" ").toLowerCase()).not.toContain("admin");
  });
});
