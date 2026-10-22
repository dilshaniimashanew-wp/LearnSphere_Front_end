"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { DEMO_MODE, useAuth } from "@/features/auth/auth-context";
import { ApiRequestError, api } from "@/lib/api";

export function EnrollButton({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  if (!user) {
    return (
      <ButtonLink href="/login" className="w-full">
        Sign in to enroll
      </ButtonLink>
    );
  }
  if (user.role !== "student") {
    return <Alert>Only students can enroll in courses.</Alert>;
  }

  async function enroll() {
    setBusy(true);
    setMessage(null);
    try {
      if (!DEMO_MODE) await api(`/courses/${courseId}/enroll`, { method: "POST" });
      setMessage({ tone: "success", text: "You are enrolled." });
      router.push("/student/courses");
    } catch (e) {
      const text = e instanceof ApiRequestError && e.status === 409 ? "You are already enrolled." : "Could not enroll. Try again.";
      setMessage({ tone: "danger", text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={enroll} disabled={busy}>
        {busy ? "Enrolling..." : "Enroll now"}
      </Button>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
    </div>
  );
}
