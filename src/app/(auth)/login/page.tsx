"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { homePathFor, useAuth } from "@/features/auth/auth-context";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { ApiRequestError } from "@/lib/api";
import type { Role } from "@/types";

// Sample accounts created by `npm run seed:demo` in the API project. Shown only when enabled.
const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";
const demoAccounts = [
  { label: "Student", email: "nimali@learnsphere.test", password: "Student@12345" },
  { label: "Instructor", email: "amara@learnsphere.test", password: "Instructor@12345" },
  { label: "Admin", email: "admin@learnsphere.test", password: "Admin@12345" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function destination(role: Role) {
    const next = new URLSearchParams(window.location.search).get("next");
    // Only follow same-site relative paths to avoid open redirects.
    return next && next.startsWith("/") && !next.startsWith("//") ? next : homePathFor(role);
  }

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const user = await login(values);
      router.push(destination(user.role));
    } catch (e) {
      setFormError(e instanceof ApiRequestError ? e.message : "Cannot reach the server. Please try again.");
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError && <Alert tone="danger">{formError}</Alert>}
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Demo accounts: fill the form</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((a) => (
              <Button
                key={a.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("email", a.email, { shouldValidate: true });
                  setValue("password", a.password, { shouldValidate: true });
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to LearnSphere?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
