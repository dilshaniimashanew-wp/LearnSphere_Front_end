"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui/feedback";
import { Card } from "@/components/ui/card";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";

interface Result {
  quizTitle: string;
  score: number;
  maxScore: number;
  percent: number;
  passMark: number;
  passed: boolean;
  questions: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    chosenOptionId: string | null;
    correctOptionId: string;
    isCorrect: boolean;
  }[];
}

export function QuizResult({ attemptId }: { attemptId: string }) {
  const { data, error, loading } = useApi<Result>(`/quiz-attempts/${attemptId}/result`);
  return (
    <Query loading={loading} error={error}>
      {data && (
        <>
          <PageHeader
            title={data.quizTitle}
            description={`Score ${data.score} / ${data.maxScore} (${data.percent}%). Pass mark ${data.passMark}%.`}
            action={<Badge tone={data.passed ? "success" : "danger"}>{data.passed ? "passed" : "not passed"}</Badge>}
          />
          <div className="space-y-3">
            {data.questions.map((q, i) => (
              <Card key={q.id}>
                <p className="flex items-start gap-2 font-medium">
                  {q.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-label="Correct" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-label="Incorrect" />
                  )}
                  {i + 1}. {q.prompt}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((o) => (
                    <li
                      key={o.id}
                      className={
                        o.id === q.correctOptionId
                          ? "font-medium text-success"
                          : o.id === q.chosenOptionId
                            ? "text-danger"
                            : "text-muted-foreground"
                      }
                    >
                      {o.text}
                      {o.id === q.correctOptionId && " (correct answer)"}
                      {o.id === q.chosenOptionId && o.id !== q.correctOptionId && " (your answer)"}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}
    </Query>
  );
}
