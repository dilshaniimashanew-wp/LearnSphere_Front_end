"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";
import { Alert, PageHeader } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { QuizSummary } from "@/types";

interface Attempt {
  attemptId: string;
  deadline: string;
  questions: { id: string; type: string; prompt: string; options: { id: string; text: string }[]; points: number }[];
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function QuizTaker({ quizId }: { quizId: string }) {
  const router = useRouter();
  const quiz = useApi<QuizSummary & { questions: unknown[] }>(`/quizzes/${quizId}`);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitted = useRef(false);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const a = await send<Attempt>("POST", `/quizzes/${quizId}/attempts`);
      setAttempt(a);
      setRemaining(new Date(a.deadline).getTime() - Date.now());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const submit = useCallback(async () => {
    if (!attempt || submitted.current) return;
    submitted.current = true;
    setBusy(true);
    try {
      await send("POST", `/quiz-attempts/${attempt.attemptId}/submit`, {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      });
    } catch (e) {
      // A time-expired attempt is still closed on the server, so the result page is the right place to go.
      setError(errorMessage(e));
    }
    router.push(`/student/results/${attempt.attemptId}`);
  }, [attempt, answers, router]);

  useEffect(() => {
    if (!attempt) return;
    const t = setInterval(() => {
      const left = new Date(attempt.deadline).getTime() - Date.now();
      setRemaining(left);
      if (left <= 0) void submit();
    }, 500);
    return () => clearInterval(t);
  }, [attempt, submit]);

  return (
    <Query loading={quiz.loading} error={quiz.error}>
      {quiz.data && (
        <>
          <PageHeader title={quiz.data.title} description={quiz.data.instructions} />
          {error && <div className="mb-4"><Alert tone="danger">{error}</Alert></div>}

          {!attempt ? (
            <Card className="space-y-3">
              <p className="text-sm">
                {quiz.data.questions.length} questions &middot; {Math.round(quiz.data.timeLimitSeconds / 60)} minute limit &middot; pass mark {quiz.data.passMark}% &middot; up to {quiz.data.maxAttempts} attempts.
              </p>
              <p className="text-sm text-muted-foreground">The timer starts as soon as you begin. Your answers are submitted automatically when time runs out.</p>
              <Button onClick={() => void start()} disabled={busy}>
                {busy ? "Starting..." : "Start quiz"}
              </Button>
            </Card>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="space-y-4"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2" role="timer" aria-live="off">
                <span className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4" aria-hidden /> Time left
                </span>
                <span className={`font-mono text-lg ${remaining < 60_000 ? "text-danger" : ""}`}>{formatClock(remaining)}</span>
              </div>
              {attempt.questions.map((q, i) => (
                <Card key={q.id}>
                  <fieldset>
                    <legend className="font-medium">
                      {i + 1}. {q.prompt} <span className="text-sm font-normal text-muted-foreground">({q.points} pt)</span>
                    </legend>
                    <div className="mt-3 space-y-2">
                      {q.options.map((o) => (
                        <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                          <input type="radio" name={q.id} value={o.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} />
                          {o.text}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </Card>
              ))}
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting..." : "Submit quiz"}
              </Button>
            </form>
          )}
        </>
      )}
    </Query>
  );
}
