"use client";

import { useState } from "react";
import { Alert, Badge, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Query } from "@/components/ui/query";
import { AnnouncementsPanel } from "@/features/courses/announcements-panel";
import { CourseForm } from "@/features/courses/course-form";
import { AssignmentManager } from "@/features/instructor/assignment-manager";
import { CurriculumManager } from "@/features/instructor/curriculum-manager";
import { QuizBuilder } from "@/features/instructor/quiz-builder";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { Course, CourseStatus } from "@/types";

const tone: Record<CourseStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  rejected: "danger",
  archived: "neutral",
};

interface StudentRow {
  studentId: string;
  name: string;
  email: string;
  status: string;
  progress: number;
}

export function CourseEditor({ courseId }: { courseId: string }) {
  const course = useApi<Course>(`/courses/${courseId}`);
  const students = useApi<StudentRow[]>(`/courses/${courseId}/students`);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function act(path: string, success: string) {
    setMessage(null);
    try {
      await send("POST", path);
      setMessage({ tone: "success", text: success });
      course.reload();
    } catch (e) {
      setMessage({ tone: "danger", text: errorMessage(e) });
    }
  }

  const c = course.data;
  const canSubmit = c && (c.status === "draft" || c.status === "rejected");

  return (
    <Query loading={course.loading} error={course.error}>
      {c && (
        <div className="space-y-8">
          <PageHeader
            title={c.title}
            description={`${c.lessonCount} lessons, ${c.students} students`}
            action={<Badge tone={tone[c.status]}>{c.status.replace("_", " ")}</Badge>}
          />
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          {c.status === "rejected" && c.moderationNote && <Alert tone="danger">Rejected by admin: {c.moderationNote}</Alert>}
          {c.status === "pending_review" && <Alert tone="info">Waiting for admin approval. You can keep editing content.</Alert>}

          <div className="flex flex-wrap gap-2">
            {canSubmit && (
              <Button onClick={() => void act(`/courses/${c.id}/submit-review`, "Submitted for review.")}>Submit for review</Button>
            )}
            {c.status !== "archived" && (
              <Button
                variant="outline"
                onClick={() =>
                  window.confirm("Archive this course? Students will no longer be able to enroll.") &&
                  void act(`/courses/${c.id}/archive`, "Course archived.")
                }
              >
                Archive
              </Button>
            )}
          </div>

          <section aria-labelledby="details" className="space-y-3">
            <h2 id="details" className="text-lg font-semibold">
              Details
            </h2>
            <CourseForm course={c} onSaved={course.reload} />
          </section>

          <CurriculumManager course={c} onChanged={course.reload} />
          <QuizBuilder courseId={c.id} />
          <AssignmentManager courseId={c.id} />
          <AnnouncementsPanel courseId={c.id} canPost />

          <section aria-labelledby="students" className="space-y-3">
            <h2 id="students" className="text-lg font-semibold">
              Students
            </h2>
            {students.data?.length === 0 && <p className="text-sm text-muted-foreground">No students enrolled yet.</p>}
            {students.data?.map((s) => (
              <Card key={s.studentId} className="space-y-2 py-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.email}</span>
                </div>
                <ProgressBar value={s.progress} label={`${s.name} progress`} />
              </Card>
            ))}
          </section>
        </div>
      )}
    </Query>
  );
}
