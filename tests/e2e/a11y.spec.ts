import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

// Automated WCAG 2 A/AA checks. They catch roughly a third of accessibility problems,
// so they complement (not replace) keyboard and screen reader testing.
async function expectNoViolations(page: Page, name: string) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.html.slice(0, 120)}`);
  expect(summary, `${name} has accessibility violations`).toEqual([]);
}

test.describe("public pages", () => {
  for (const [name, path] of [
    ["home", "/"],
    ["catalog", "/courses"],
    ["login", "/login"],
    ["register", "/register"],
    ["forgot password", "/forgot-password"],
    ["verify certificate", "/verify"],
  ] as const) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoViolations(page, name);
    });
  }

  test("course detail", async ({ page }) => {
    await page.goto("/courses");
    await page
      .getByRole("link", { name: /Modern Web Development/ })
      .first()
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expectNoViolations(page, "course detail");
  });
});

test.describe("signed-in pages", () => {
  const areas = {
    student: [
      "/student",
      "/student/courses",
      "/student/assignments",
      "/student/grades",
      "/student/certificates",
      "/student/notifications",
      "/student/profile",
    ],
    instructor: ["/instructor", "/instructor/courses", "/instructor/courses/new", "/instructor/submissions", "/instructor/analytics"],
    admin: ["/admin", "/admin/users", "/admin/courses", "/admin/categories", "/admin/audit-logs"],
  } as const;

  for (const [role, paths] of Object.entries(areas) as [keyof typeof areas, readonly string[]][]) {
    test(`${role} area`, async ({ page }) => {
      await signIn(page, DEMO[role].email, DEMO[role].password);
      await expect(page).toHaveURL(new RegExp(`/${role}$`));
      for (const path of paths) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
        await expectNoViolations(page, path);
      }
    });
  }
});
