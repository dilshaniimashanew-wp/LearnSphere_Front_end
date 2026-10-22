import { expect, test, type Page } from "@playwright/test";
import { DEMO, newUserPage, register, signIn, uniqueEmail } from "./helpers";

// One course goes through the whole life cycle, driven entirely through the browser UI.
test.describe.configure({ mode: "serial" });

const stamp = Date.now();
const COURSE = `E2E Course ${stamp}`;
const instructorEmail = uniqueEmail("instructor");
const studentEmail = uniqueEmail("student");

let instructor: Page;
let admin: Page;
let student: Page;
let courseUrl = "";

test.beforeAll(async ({ browser }) => {
  instructor = (await newUserPage(browser)).page;
  admin = (await newUserPage(browser)).page;
  student = (await newUserPage(browser)).page;
});

test.afterAll(async () => {
  for (const p of [instructor, admin, student]) await p?.context().close();
});

test("instructor registers and builds a course with lessons, a quiz and an assignment", async () => {
  await register(instructor, "instructor", "E2E Instructor", instructorEmail);

  // Create the draft.
  await instructor.goto("/instructor/courses/new");
  await instructor.getByLabel("Title", { exact: true }).fill(COURSE);
  await instructor.getByLabel("Short summary").fill("Created by the end to end browser test.");
  await instructor
    .getByLabel("Description")
    .fill("This course verifies the whole learning workflow from creation to certificate in a real browser.");
  await instructor.getByLabel("Category").selectOption({ index: 1 });
  await instructor.getByLabel("Learning objectives (one per line)").fill("Learn things\nPass the quiz");
  await instructor.getByRole("button", { name: "Create draft" }).click();
  await expect(instructor).toHaveURL(/\/instructor\/courses\/[a-f0-9]{24}$/);
  courseUrl = instructor.url();
  await expect(instructor.getByRole("heading", { name: COURSE, level: 1 })).toBeVisible();

  // Curriculum: one module, three lessons.
  await instructor.getByLabel("New module title").fill("Getting started");
  await instructor.getByRole("button", { name: "Add module" }).click();
  await expect(instructor.getByRole("heading", { name: "Module 1: Getting started" })).toBeVisible();
  for (const title of ["Lesson Alpha", "Lesson Bravo", "Lesson Charlie"]) {
    await instructor.getByRole("button", { name: "Add lesson" }).click();
    await instructor.getByLabel("Lesson title").fill(title);
    await instructor.getByLabel("Content").fill(`Body of ${title}`);
    await instructor.getByRole("button", { name: "Save lesson" }).click();
    await expect(instructor.getByText(title, { exact: false }).first()).toBeVisible();
  }

  // Quiz: option 1 is the correct answer.
  await instructor.getByRole("button", { name: "New quiz" }).click();
  await instructor.locator("#qz-title").fill("E2E quiz");
  await instructor.locator("#qp-0").fill("Pick the first option");
  await instructor.getByLabel("Option 1", { exact: true }).fill("Right");
  await instructor.getByLabel("Option 2", { exact: true }).fill("Wrong");
  await instructor.getByRole("button", { name: "Save quiz" }).click();
  await expect(instructor.getByText("E2E quiz")).toBeVisible();

  // Assignment.
  await instructor.getByRole("button", { name: "New assignment" }).click();
  await instructor.locator("#as-title").fill("E2E assignment");
  await instructor.locator("#as-ins").fill("Write a few words about what you learned.");
  await instructor.locator("#as-due").fill("2030-01-01T10:00");
  await instructor.getByRole("button", { name: "Create assignment" }).click();
  await expect(instructor.getByText("E2E assignment")).toBeVisible();

  // An announcement for later.
  await instructor.locator("#an-title").fill("Welcome aboard");
  await instructor.locator("#an-body").fill("Start with Lesson Alpha.");
  await instructor.getByRole("button", { name: "Post announcement" }).click();
  await expect(instructor.getByText("Welcome aboard")).toBeVisible();
});

test("instructor reorders lessons by dragging, and with the arrow buttons", async () => {
  await instructor.goto(courseUrl);
  const lessonTitles = () => instructor.locator("li", { has: instructor.getByRole("img", { name: /^Drag lesson / }) }).allInnerTexts();
  const names = async () => (await lessonTitles()).map((t) => t.match(/Lesson \w+/)?.[0]);
  await expect(instructor.getByRole("img", { name: "Drag lesson Lesson Charlie" })).toBeVisible();
  expect(await names()).toEqual(["Lesson Alpha", "Lesson Bravo", "Lesson Charlie"]);

  // Drag Charlie onto Alpha: Charlie moves to the front.
  await instructor.getByRole("img", { name: "Drag lesson Lesson Charlie" }).dragTo(instructor.locator("li", { hasText: "Lesson Alpha" }));
  await expect.poll(names).toEqual(["Lesson Charlie", "Lesson Alpha", "Lesson Bravo"]);

  // The order survives a reload (it was saved on the server).
  await instructor.reload();
  await expect.poll(names).toEqual(["Lesson Charlie", "Lesson Alpha", "Lesson Bravo"]);

  // Keyboard-accessible alternative: move Charlie down one place.
  await instructor.getByRole("button", { name: "Move lesson Lesson Charlie down" }).click();
  await expect.poll(names).toEqual(["Lesson Alpha", "Lesson Charlie", "Lesson Bravo"]);
});

test("instructor edits a quiz question and submits the course for review", async () => {
  await instructor.goto(courseUrl);
  await instructor.getByRole("button", { name: "Edit", exact: true }).first().click();
  await instructor.locator("#qp-0").fill("Pick the first option (edited)");
  await instructor.getByRole("button", { name: "Save changes" }).last().click();
  await expect(instructor.getByText("E2E quiz")).toBeVisible();
  await instructor.getByRole("button", { name: "Edit", exact: true }).first().click();
  await expect(instructor.locator("#qp-0")).toHaveValue("Pick the first option (edited)");
  await instructor.getByRole("button", { name: "Cancel" }).last().click();

  await instructor.getByRole("button", { name: "Submit for review" }).click();
  await expect(instructor.getByText("Submitted for review.")).toBeVisible();
  await expect(instructor.getByText("Waiting for admin approval")).toBeVisible();
});

test("the course is hidden from students until an admin approves it", async ({ browser }) => {
  const visitor = (await newUserPage(browser)).page;
  await visitor.goto("/courses");
  await visitor.getByLabel("Search courses").fill(COURSE);
  await expect(visitor.getByText("0 courses found")).toBeVisible();
  await visitor.context().close();
});

test("admin rejects the course with a note, the instructor resubmits, and the admin approves", async () => {
  await signIn(admin, DEMO.admin.email, DEMO.admin.password);
  await expect(admin).toHaveURL(/\/admin$/);
  await admin.goto("/admin/courses");
  const card = admin
    .locator("div", { has: admin.getByText(COURSE) })
    .filter({ has: admin.getByRole("button", { name: "Approve" }) })
    .last();
  await card.getByRole("button", { name: "Reject" }).click();
  await admin.getByLabel("Moderation note (required)").fill("Please add a prerequisite list.");
  await admin.getByRole("button", { name: "Confirm rejection" }).click();
  await expect(admin.getByText("Course rejected. The instructor was notified.")).toBeVisible();

  // The instructor sees the note and resubmits.
  await instructor.goto(courseUrl);
  await expect(instructor.getByText("Rejected by admin: Please add a prerequisite list.")).toBeVisible();
  await instructor.getByRole("button", { name: "Submit for review" }).click();
  await expect(instructor.getByText("Submitted for review.")).toBeVisible();

  await admin.goto("/admin/courses");
  const again = admin
    .locator("div", { has: admin.getByText(COURSE) })
    .filter({ has: admin.getByRole("button", { name: "Approve" }) })
    .last();
  await again.getByRole("button", { name: "Approve" }).click();
  await expect(admin.getByText("Course approved and published.")).toBeVisible();
});

test("student registers, finds the course, enrolls and reads the announcement", async () => {
  await register(student, "student", "E2E Student", studentEmail);
  await student.goto("/courses");
  await student.getByLabel("Search courses").fill(COURSE);
  await student.getByRole("link", { name: new RegExp(COURSE) }).click();
  await expect(student.getByRole("heading", { name: COURSE, level: 1 })).toBeVisible();
  // Lesson bodies are private before enrolling.
  await expect(student.getByText("Body of Lesson Alpha")).toHaveCount(0);
  await student.getByRole("button", { name: "Enroll now" }).click();
  await expect(student).toHaveURL(/\/student\/courses\/[a-f0-9]{24}$/);
  await expect(student.getByText("Welcome aboard")).toBeVisible();

  // An announcement posted now notifies the enrolled student.
  await instructor.goto(courseUrl);
  await instructor.locator("#an-title").fill("Quiz tomorrow");
  await instructor.locator("#an-body").fill("Please revise all three lessons.");
  await instructor.getByRole("button", { name: "Post announcement" }).click();
  await expect(instructor.getByText("Quiz tomorrow")).toBeVisible();
});

test("student completes the lessons, passes the quiz and the course completes", async () => {
  for (const title of ["Lesson Alpha", "Lesson Charlie", "Lesson Bravo"]) {
    await student.getByRole("button", { name: title }).click();
    await expect(student.getByText(`Body of ${title}`)).toBeVisible();
    await student.getByRole("button", { name: "Mark as complete" }).click();
    await expect(student.getByRole("button", { name: "Mark as not complete" })).toBeVisible();
  }
  // Lessons are done but the quiz is not passed yet, so the course is not complete.
  await expect(student.getByText("Course complete!")).toHaveCount(0);

  await student.getByRole("link", { name: "Start quiz" }).click();
  await student.getByRole("button", { name: "Start quiz" }).click();
  await student.getByLabel("Right").check();
  await student.getByRole("button", { name: "Submit quiz" }).click();
  await expect(student).toHaveURL(/\/student\/results\//);
  await expect(student.getByText("passed", { exact: true })).toBeVisible();
  await expect(student.getByText("(correct answer)")).toBeVisible();

  await student.goto("/student/courses");
  await student.getByRole("link", { name: COURSE }).click();
  await expect(student.getByText("Course complete!")).toBeVisible();
});

test("student submits the assignment; the instructor grades it; the student sees grade, certificate and notifications", async ({
  browser,
}) => {
  await student.getByRole("button", { name: "Submit work" }).click();
  await student.getByLabel("Your response").fill("I learned a lot about the workflow.");
  await student.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(student.getByText("submitted", { exact: true })).toBeVisible();

  await instructor.goto("/instructor/submissions");
  const card = instructor
    .locator("div", { has: instructor.getByText("E2E assignment") })
    .filter({ has: instructor.getByRole("button", { name: "Save grade" }) })
    .last();
  await card.getByLabel(/Points/).fill("18");
  await card.getByLabel("Feedback").fill("Nice reflection.");
  await card.getByRole("button", { name: "Save grade" }).click();
  await expect(instructor.getByText("Grade saved. The student was notified.")).toBeVisible();

  await student.goto("/student/grades");
  await expect(student.getByRole("cell", { name: "18 / 100" })).toBeVisible();
  await expect(student.getByText("Nice reflection.")).toBeVisible();

  await student.goto("/student/certificates");
  await expect(student.getByRole("heading", { name: COURSE })).toBeVisible();
  const code =
    (await student
      .getByText(/^LS-[0-9A-F]{4}-[0-9A-F]{4}$/)
      .first()
      .textContent()) ?? "";
  expect(code).toMatch(/^LS-/);

  await student.goto("/student/notifications");
  await expect(student.getByText("Assignment graded")).toBeVisible();
  await expect(student.getByText("Course completed")).toBeVisible();
  await expect(student.getByText("Announcement: Quiz tomorrow")).toBeVisible();

  // Anyone can verify the certificate, and sees only the minimum.
  const v = (await newUserPage(browser)).page;
  await v.goto("/verify");
  await v.getByLabel("Certificate code").fill(code);
  await v.getByRole("button", { name: "Verify" }).click();
  await expect(v.getByText("Valid certificate")).toBeVisible();
  await expect(v.getByText("E2E Student")).toBeVisible();
  await expect(v.getByText(studentEmail)).toHaveCount(0);
  await v.context().close();
});

test("student reviews the completed course and the rating appears in the catalog", async () => {
  await student.goto("/courses");
  await student.getByLabel("Search courses").fill(COURSE);
  await student.getByRole("link", { name: new RegExp(COURSE) }).click();
  await student.getByText("5 stars").first().click({ force: true });
  await student.getByLabel("Comment (optional)").fill("Great end to end course.");
  await student.getByRole("button", { name: "Submit review" }).click();
  await expect(student.getByText("Thanks! Your review was saved.")).toBeVisible();
  await expect(student.getByText("Great end to end course.")).toBeVisible();

  await student.goto("/courses");
  await student.getByLabel("Search courses").fill(COURSE);
  await expect(student.getByRole("img", { name: "5 out of 5, 1 review" })).toBeVisible();
});
