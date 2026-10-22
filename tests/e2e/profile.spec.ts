import { expect, test } from "@playwright/test";
import { PASSWORD, appAlert, register, signIn, uniqueEmail } from "./helpers";

// A valid 8x8 red PNG.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGO4o6aGFTEMLQkAF/tKAS/fz4YAAAAASUVORK5CYII=", "base64");

test("a user can set and remove a profile picture, rename themselves and change their password", async ({ page }) => {
  const email = uniqueEmail("profile");
  await register(page, "student", "Profile Tester", email);
  await page.goto("/student/profile");

  // No picture yet: initials are shown in the sidebar.
  await expect(page.locator("aside").getByText("PT")).toBeVisible();
  await page.locator("#avatar-file").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Profile picture updated.")).toBeVisible();
  await expect(page.locator("aside img")).toBeVisible();
  const src = await page.locator("aside img").getAttribute("src");
  expect(src).toMatch(/^data:image\/jpeg;base64,/);

  await page.reload();
  await expect(page.locator("aside img")).toBeVisible(); // persisted on the server

  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Profile picture removed.")).toBeVisible();
  await expect(page.locator("aside img")).toHaveCount(0);

  // Wrong file types are refused before anything is sent.
  await page.locator("#avatar-file").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(page.getByText("Choose a JPEG, PNG or WebP image.")).toBeVisible();

  // Rename.
  await page.getByLabel("Full name").fill("Renamed Tester");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await expect(page.locator("aside").getByText("Renamed Tester")).toBeVisible();

  // Password change: the old password stops working.
  await page.getByLabel("Current password").fill(PASSWORD);
  await page.getByLabel("New password", { exact: true }).fill("BrandNew123");
  await page.getByLabel("Confirm new password").fill("BrandNew123");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText("Password updated.")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, email, PASSWORD);
  await expect(appAlert(page)).toContainText("Invalid email or password");
  await signIn(page, email, "BrandNew123");
  await expect(page).toHaveURL(/\/student$/);
});
