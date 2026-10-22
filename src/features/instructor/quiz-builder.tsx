"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { QuizSummary } from "@/types";

interface Q {
  type: "multiple_choice" | "true_false";
  prompt: string;
  options: string[];
  correctIndex: number;
}

const blank = (): Q => ({ type: "multiple_choice", prompt: "", options: ["", "", "", ""], correctIndex: 0 });

export function QuizBuilder({ courseId }: { courseId: string }) {
  const quizzes = useApi<QuizSummary[]>(`/courses/${courseId}/quizzes`);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [passMark, setPassMark] = useState(60);
  const [minutes, setMinutes] = useState(15);
  const [attempts, setAttempts] = useState(3);
  const [questions, setQuestions] = useState<Q[]>([blank()]);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<Q>) => setQuestions(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await send("POST", `/courses/${courseId}/quizzes`, {
        title: title.trim(),
        passMark,
        maxAttempts: attempts,
        timeLimitSeconds: minutes * 60,
        questions: questions.map((q) => ({
          type: q.type,
          prompt: q.prompt.trim(),
          options: q.type === "true_false" ? [] : q.options.map((o) => o.trim()).filter(Boolean),
          correctIndex: q.correctIndex,
        })),
      });
      setOpen(false);
      setTitle("");
      setQuestions([blank()]);
      quizzes.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section aria-labelledby="quizzes" className="space-y-3">
      <h2 id="quizzes" className="text-lg font-semibold">
        Quizzes
      </h2>
      {quizzes.data?.map((q) => (
        <Card key={q.id} className="py-3">
          <p className="font-medium">{q.title}</p>
          <p className="text-sm text-muted-foreground">
            {q.questionCount} questions, {Math.round(q.timeLimitSeconds / 60)} min, pass mark {q.passMark}%, {q.maxAttempts} attempts
          </p>
        </Card>
      ))}
      {quizzes.data?.length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet.</p>}

      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden /> New quiz
        </Button>
      ) : (
        <Card>
          <form onSubmit={save} className="space-y-4">
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="Quiz title" htmlFor="qz-title">
              <Input id="qz-title" required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Pass mark (%)" htmlFor="qz-pass">
                <Input id="qz-pass" type="number" min={1} max={100} value={passMark} onChange={(e) => setPassMark(Number(e.target.value))} />
              </Field>
              <Field label="Time limit (min)" htmlFor="qz-time">
                <Input id="qz-time" type="number" min={1} max={180} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
              </Field>
              <Field label="Max attempts" htmlFor="qz-att">
                <Input id="qz-att" type="number" min={1} max={20} value={attempts} onChange={(e) => setAttempts(Number(e.target.value))} />
              </Field>
            </div>

            {questions.map((q, i) => (
              <fieldset key={i} className="space-y-3 rounded-lg border border-border p-4">
                <legend className="px-1 text-sm font-medium">Question {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                  <Field label="Prompt" htmlFor={`qp-${i}`}>
                    <Input id={`qp-${i}`} required minLength={3} value={q.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
                  </Field>
                  <Field label="Type" htmlFor={`qt-${i}`}>
                    <Select id={`qt-${i}`} value={q.type} onChange={(e) => update(i, { type: e.target.value as Q["type"], correctIndex: 0 })}>
                      <option value="multiple_choice">Multiple choice</option>
                      <option value="true_false">True / false</option>
                    </Select>
                  </Field>
                </div>
                {q.type === "true_false" ? (
                  <div className="flex gap-4 text-sm">
                    {["True", "False"].map((label, idx) => (
                      <label key={label} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${i}`} checked={q.correctIndex === idx} onChange={() => update(i, { correctIndex: idx })} /> {label} is correct
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q.options.map((o, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${i}`} aria-label={`Option ${idx + 1} is correct`} checked={q.correctIndex === idx} onChange={() => update(i, { correctIndex: idx })} />
                        <Input aria-label={`Option ${idx + 1}`} placeholder={`Option ${idx + 1}`} value={o} onChange={(e) => update(i, { options: q.options.map((x, k) => (k === idx ? e.target.value : x)) })} />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer. Empty options are ignored.</p>
                  </div>
                )}
                {questions.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setQuestions(questions.filter((_, k) => k !== i))}>
                    <Trash2 className="h-4 w-4" aria-hidden /> Remove question
                  </Button>
                )}
              </fieldset>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQuestions([...questions, blank()])}>
                <Plus className="h-4 w-4" aria-hidden /> Add question
              </Button>
              <Button type="submit">Save quiz</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </section>
  );
}
