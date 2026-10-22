import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/lib/api";
import LoginPage from "./page";

const push = vi.fn();
const login = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock("@/features/auth/auth-context", () => ({
  useAuth: () => ({ login }),
  homePathFor: (role: string) => `/${role}`,
}));

beforeEach(() => {
  push.mockReset();
  login.mockReset();
});

describe("LoginPage", () => {
  it("labels its fields and shows validation errors without calling the API", async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(login).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "nope");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
  });

  it("signs in and goes to the dashboard for the user's role", async () => {
    login.mockResolvedValueOnce({ role: "instructor" });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "amara@learnsphere.test");
    await userEvent.type(screen.getByLabelText("Password"), "Instructor@12345");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/instructor"));
    expect(login).toHaveBeenCalledWith({ email: "amara@learnsphere.test", password: "Instructor@12345" });
  });

  it("shows the server's message when sign-in fails", async () => {
    login.mockRejectedValueOnce(new ApiRequestError(401, { code: "UNAUTHENTICATED", message: "Invalid email or password" }));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(push).not.toHaveBeenCalled();
  });

  it("explains when the server cannot be reached", async () => {
    login.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot reach the server");
  });

  it("ignores an external redirect target (open-redirect protection)", async () => {
    window.history.pushState({}, "", "/login?next=//evil.test");
    login.mockResolvedValueOnce({ role: "student" });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/student"));
    window.history.pushState({}, "", "/");
  });

  it("follows a same-site redirect target", async () => {
    window.history.pushState({}, "", "/login?next=/student/grades");
    login.mockResolvedValueOnce({ role: "student" });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/student/grades"));
    window.history.pushState({}, "", "/");
  });
});
