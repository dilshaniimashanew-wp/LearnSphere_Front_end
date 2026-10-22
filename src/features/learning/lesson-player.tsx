"use client";

import Link from "next/link";
import { useState } from "react";
import { Award, CheckCircle2, Circle, ClipboardList, HelpCircle, PlayCircle } from "lucide-react";
import { AssignmentCard } from "@/features/assignments/assignment-card";
import { Alert, Badge, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { Assignment, Course, QuizSummary } from "@/types";

interface Progress {
  percent: number;
  completedLessonIds: string[];
  complete: boolean;
  quizzes: { total: number; passed: number };
}

export function LessonPlayer({ courseId }: { courseId: string }) {
  const course = useApi<Course>(`/courses/${courseId}/lessons`);
  const progress = useApi<Progress>(`/courses/${courseId}/progress`);
  const quizzes = useApi<QuizSummary[]>(`/courses/${courseId}/quizzes`);
  const assignments = useApi<Assignment[]>(`/courses/${courseId}/assignments`);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lessons = course.data?.modules?.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title }))) ?? [];
  const current = lessons.find((l) => l.id === (currentId ?? lessons[0]?.id));
  const done = new Set(progress.data?.completedLessonIds ?? []);

  async function toggle(lessonId: string, completed: boolean) {
    setBusy(true);
    setError(null);
    try {
      await send("POST", `/lessons/${lessonId}/progress`, { completed });
      progress.reload();
      quizzes.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const embed = current?.videoUrl?.startsWith("https://www.youtube.com/embed/") ? current.videoUrl : null;

  return (
    <Query loading={course.loading || progress.loading} error={course.error ?? progress.error}>
      {course.data && (
        <>
          <PageHeader title={course.data.title} description={`${progress.data?.percent ?? 0}% of required lessons complete`} />
          <div className="mb-6">
            <ProgressBar value={progress.data?.percent ?? 0} label="Course progress" />
          </div>

          {progress.data?.complete && (
            <div className="mb-6">
              <Alert tone="success">
                <span className="flex flex-wrap items-center gap-2">
                  <Award className="h-4 w-4" aria-hidden /> Course complete! Your certificate is ready.
                  <Link href="/student/certificates" className="underline">
                    View certificates
                  </Link>
                </span>
              </Alert>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <Card className="space-y-4">
              {current ? (
                <>
                  {embed ? (
                    <iframe className="aspect-video w-full rounded-lg" src={embed} title={current.title} allowFullScreen />
                  ) : current.videoUrl ? (
                    <a href={current.videoUrl} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center rounded-lg bg-muted text-primary hover:underline">
                      <PlayCircle className="mr-2 h-8 w-8" aria-hidden /> Watch video
                    </a>
                  ) : null}
                  <div>
                    <p className="text-sm text-muted-foreground">{current.module}</p>
                    <h2 className="text-xl font-semibold">{current.title}</h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{current.content || "No written content for this lesson."}</p>
                  </div>
                  {error && <Alert tone="danger">{error}</Alert>}
                  <Button variant={done.has(current.id) ? "outline" : "primary"} disabled={busy} onClick={() => void toggle(current.id, !done.has(current.id))}>
                    {done.has(current.id) ? "Mark as not complete" : "Mark as complete"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">This course has no lessons yet.</p>
              )}
            </Card>

            <nav aria-label="Course lessons" className="space-y-4">
              {course.data.modules?.map((m) => (
                <div key={m.id}>
                  <h3 className="mb-1 text-sm font-semibold">{m.title}</h3>
                  <ul className="space-y-1">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <button
                          onClick={() => setCurrentId(l.id)}
                          aria-current={l.id === current?.id ? "true" : undefined}
                          className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm", l.id === current?.id ? "bg-accent text-primary" : "hover:bg-muted")}
                        >
                          {done.has(l.id) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Completed" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                          {l.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <section className="mt-10" aria-labelledby="quizzes">
            <h2 id="quizzes" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <HelpCircle className="h-5 w-5" aria-hidden /> Quizzes
            </h2>
            {quizzes.data?.length === 0 && <p className="text-sm text-muted-foreground">No quizzes in this course.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {quizzes.data?.map((q) => (
                <Card key={q.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{q.title}</p>
                    {q.passed ? <Badge tone="success">passed</Badge> : q.attemptsUsed ? <Badge tone="warning">not passed</Badge> : <Badge>new</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {q.questionCount} questions, {Math.round(q.timeLimitSeconds / 60)} min, pass mark {q.passMark}%. Attempts {q.attemptsUsed ?? 0}/{q.maxAttempts}
                    {q.bestScore != null && `, best ${q.bestScore}%`}.
                  </p>
                  <div className="flex gap-2">
                    {(q.attemptsUsed ?? 0) < q.maxAttempts && (
                      <ButtonLink href={`/student/quizzes/${q.id}`} size="sm">
                        {q.attemptsUsed ? "Try again" : "Start quiz"}
                      </ButtonLink>
                    )}
                    {q.latestAttemptId && (
                      <ButtonLink href={`/student/results/${q.latestAttemptId}`} size="sm" variant="outline">
                        Last result
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="assignments">
            <h2 id="assignments" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <ClipboardList className="h-5 w-5" aria-hidden /> Assignments
            </h2>
            {assignments.data?.length === 0 && <p className="text-sm text-muted-foreground">No assignments in this course.</p>}
            <div className="space-y-3">
              {assignments.data?.map((a) => (
                <AssignmentCard key={a.id} assignment={a} onChanged={assignments.reload} />
              ))}
            </div>
          </section>
        </>
      )}
    </Query>
  );
}
