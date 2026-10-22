"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { homePathFor, useAuth } from "@/features/auth/auth-context";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { ApiRequestError } from "@/lib/api";

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: "student" } });

  async function onSubmit(form: RegisterValues) {
    const values = { name: form.name, email: form.email, password: form.password, role: form.role };
    setFormError(null);
    try {
      const user = await signUp(values);
      router.push(homePathFor(user.role));
    } catch (e) {
      setFormError(e instanceof ApiRequestError ? e.message : "Cannot reach the server. Please try again.");
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start learning or teaching in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError && <Alert tone="danger">{formError}</Alert>}
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="I want to" htmlFor="role" error={errors.role?.message}>
          <Select id="role" {...register("role")}>
            <option value="student">Learn (student)</option>
            <option value="instructor">Teach (instructor)</option>
          </Select>
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline underline-offset-2 hover:no-underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
