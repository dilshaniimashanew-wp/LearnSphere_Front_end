"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, PageHeader } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { useAuth } from "@/features/auth/auth-context";
import { errorMessage, send } from "@/lib/use-api";
import type { User } from "@/types";

const profileSchema = z.object({ name: z.string().trim().min(2, "Name must be at least 2 characters").max(80) });
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Include an uppercase letter").regex(/[0-9]/, "Include a number"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Msg = { tone: "success" | "danger"; text: string } | null;

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);

  const profile = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? "" } });
  const password = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  async function saveProfile(values: z.infer<typeof profileSchema>) {
    try {
      setUser(await send<User>("PATCH", "/users/me", values));
      setProfileMsg({ tone: "success", text: "Profile saved." });
    } catch (e) {
      setProfileMsg({ tone: "danger", text: errorMessage(e) });
    }
  }

  async function changePassword({ currentPassword, newPassword }: z.infer<typeof passwordSchema>) {
    try {
      await send("PATCH", "/users/me/password", { currentPassword, newPassword });
      setPasswordMsg({ tone: "success", text: "Password updated." });
      password.reset();
    } catch (e) {
      setPasswordMsg({ tone: "danger", text: errorMessage(e) });
    }
  }

  return (
    <>
      <PageHeader title="Profile" description="Manage your account details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Details</h2>
          <form onSubmit={profile.handleSubmit(saveProfile)} noValidate className="space-y-4">
            {profileMsg && <Alert tone={profileMsg.tone}>{profileMsg.text}</Alert>}
            <Field label="Full name" htmlFor="name" error={profile.formState.errors.name?.message}>
              <Input id="name" {...profile.register("name")} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" value={user?.email ?? ""} disabled readOnly />
            </Field>
            <Button type="submit" disabled={profile.formState.isSubmitting}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Change password</h2>
          <form onSubmit={password.handleSubmit(changePassword)} noValidate className="space-y-4">
            {passwordMsg && <Alert tone={passwordMsg.tone}>{passwordMsg.text}</Alert>}
            <Field label="Current password" htmlFor="currentPassword" error={password.formState.errors.currentPassword?.message}>
              <Input id="currentPassword" type="password" autoComplete="current-password" {...password.register("currentPassword")} />
            </Field>
            <Field label="New password" htmlFor="newPassword" error={password.formState.errors.newPassword?.message}>
              <Input id="newPassword" type="password" autoComplete="new-password" {...password.register("newPassword")} />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm" error={password.formState.errors.confirm?.message}>
              <Input id="confirm" type="password" autoComplete="new-password" {...password.register("confirm")} />
            </Field>
            <Button type="submit" disabled={password.formState.isSubmitting}>
              Update password
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
