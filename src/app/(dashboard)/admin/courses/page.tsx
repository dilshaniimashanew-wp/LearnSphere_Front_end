"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, EmptyState, PageHeader } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { Course } from "@/types";

export default function CourseApprovalsPage() {
  const { data, error, loading, reload } = useApi<Course[]>("/admin/courses/pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function approve(id: string) {
    setMessage(null);
    try {
      await send("PATCH", `/admin/courses/${id}/approve`);
      setMessage({ tone: "success", text: "Course approved and published." });
      reload();
    } catch (e) {
      setMessage({ tone: "danger", text: errorMessage(e) });
    }
  }

  async function reject(id: string) {
    setMessage(null);
    try {
      await send("PATCH", `/admin/courses/${id}/reject`, { note });
      setMessage({ tone: "success", text: "Course rejected. The instructor was notified." });
      setRejecting(null);
      setNote("");
      reload();
    } catch (e) {
      setMessage({ tone: "danger", text: errorMessage(e) });
    }
  }

  return (
    <>
      <PageHeader title="Course approvals" description="Review courses submitted by instructors." />
      {message && <div className="mb-4"><Alert tone={message.tone}>{message.text}</Alert></div>}
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="Nothing to review" description="New submissions will appear here." />
        ) : (
          <div className="space-y-3">
            {data?.map((c) => (
              <Card key={c.id} className="space-y-3">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.instructor} &middot; {c.category} &middot; {c.level} &middot; {c.lessonCount} lessons
                  </p>
                  <p className="mt-2 text-sm">{c.summary}</p>
                  <Link href={`/courses/${c.id}`} className="mt-1 inline-block text-sm text-primary underline">
                    Preview course
                  </Link>
                </div>
                {rejecting === c.id ? (
                  <div className="space-y-2">
                    <Field label="Moderation note (required)" htmlFor={`note-${c.id}`}>
                      <Textarea id={`note-${c.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                    </Field>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" disabled={note.trim().length < 3} onClick={() => void reject(c.id)}>
                        Confirm rejection
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRejecting(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void approve(c.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejecting(c.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Query>
    </>
  );
}
