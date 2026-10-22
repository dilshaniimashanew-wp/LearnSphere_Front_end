"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, ProgressBar } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

export function LessonPlayer({ course }: { course: Course }) {
  const lessons = useMemo(() => course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title }))), [course]);
  const [currentId, setCurrentId] = useState(lessons[0]?.id);
  const [done, setDone] = useState<Set<string>>(new Set());

  const current = lessons.find((l) => l.id === currentId);
  const percent = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  // Local state only; this becomes POST /lessons/:lessonId/progress once the API exists.
  function toggleDone(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHeader title={course.title} description={`${percent}% complete`} />
      <div className="mb-6">
        <ProgressBar value={percent} label="Course progress" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="space-y-4">
          {current ? (
            <>
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-label="Video placeholder">
                <PlayCircle className="h-12 w-12" aria-hidden />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{current.module}</p>
                <h2 className="text-xl font-semibold">{current.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lesson content appears here: text, video, downloadable resources or embedded content.
                </p>
              </div>
              <Button variant={done.has(current.id) ? "outline" : "primary"} onClick={() => toggleDone(current.id)}>
                {done.has(current.id) ? "Mark as not complete" : "Mark as complete"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">This course has no lessons yet.</p>
          )}
        </Card>

        <nav aria-label="Course lessons" className="space-y-4">
          {course.modules.map((m) => (
            <div key={m.id}>
              <h3 className="mb-1 text-sm font-semibold">{m.title}</h3>
              <ul className="space-y-1">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => setCurrentId(l.id)}
                      aria-current={l.id === currentId ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                        l.id === currentId ? "bg-accent text-primary" : "hover:bg-muted",
                      )}
                    >
                      {done.has(l.id) ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Completed" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
