import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/features/auth/schemas";

const validRegistration = {
  name: "Test Person",
  email: "person@example.com",
  password: "Passw0rd!",
  confirmPassword: "Passw0rd!",
  role: "student",
};

describe("loginSchema", () => {
  it("accepts a valid login and trims the email", () => {
    expect(loginSchema.parse({ email: "  a@b.co ", password: "x" }).email).toBe("a@b.co");
  });

  it.each([
    [{ email: "", password: "x" }, "Email is required"],
    [{ email: "not-an-email", password: "x" }, "Enter a valid email"],
    [{ email: "a@b.co", password: "" }, "Password is required"],
  ])("rejects %j", (input, message) => {
    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toContain(message);
  });
});

describe("registerSchema", () => {
  it("accepts a valid registration", () => expect(registerSchema.safeParse(validRegistration).success).toBe(true));

  it("never allows the admin role from the public form", () => {
    expect(registerSchema.safeParse({ ...validRegistration, role: "admin" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegistration, role: "instructor" }).success).toBe(true);
  });

  it.each([
    ["too short", "Ab1"],
    ["no uppercase", "password1"],
    ["no number", "Password"],
  ])("enforces the password policy (%s)", (_label, password) => {
    expect(registerSchema.safeParse({ ...validRegistration, password, confirmPassword: password }).success).toBe(false);
  });

  it("requires the confirmation to match and reports it on the right field", () => {
    const result = registerSchema.safeParse({ ...validRegistration, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ message: "Passwords do not match", path: ["confirmPassword"] });
  });

  it("requires a name of at least 2 characters", () => {
    expect(registerSchema.safeParse({ ...validRegistration, name: "A" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("validates the email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
