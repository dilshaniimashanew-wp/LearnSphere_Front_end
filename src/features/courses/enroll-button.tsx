"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { useAuth } from "@/features/auth/auth-context";
import { errorMessage, send } from "@/lib/use-api";

export function EnrollButton({ courseId, enrolled }: { courseId: string; enrolled?: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <ButtonLink href="/login" className="w-full">
        Sign in to enroll
      </ButtonLink>
    );
  }
  if (user.role !== "student") return <Alert>Only students can enroll in courses.</Alert>;
  if (enrolled) {
    return (
      <ButtonLink href={`/student/courses/${courseId}`} className="w-full">
        Continue learning
      </ButtonLink>
    );
  }

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      await send("POST", `/courses/${courseId}/enroll`);
      router.push(`/student/courses/${courseId}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={enroll} disabled={busy}>
        {busy ? "Enrolling..." : "Enroll now"}
      </Button>
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
