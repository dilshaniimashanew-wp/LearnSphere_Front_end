"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { api } from "@/lib/api";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { QuizSummary } from "@/types";

interface Q {
  id?: string; // set for questions that already exist on the server
  type: "multiple_choice" | "true_false";
  prompt: string;
  options: string[];
  correctIndex: number;
}

interface QuizDraft {
  id?: string;
  title: string;
  passMark: number;
  minutes: number;
  attempts: number;
  questions: Q[];
}

interface ServerQuiz {
  id: string;
  title: string;
  passMark: number;
  maxAttempts: number;
  timeLimitSeconds: number;
  questions: { id: string; type: Q["type"]; prompt: string; options: { id: string; text: string }[]; correctOptionId: string }[];
}

const blankQuestion = (): Q => ({ type: "multiple_choice", prompt: "", options: ["", "", "", ""], correctIndex: 0 });
const blankDraft = (): QuizDraft => ({ title: "", passMark: 60, minutes: 15, attempts: 3, questions: [blankQuestion()] });

export function QuizBuilder({ courseId }: { courseId: string }) {
  const quizzes = useApi<QuizSummary[]>(`/courses/${courseId}/quizzes`);
  const [draft, setDraft] = useState<QuizDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function edit(quizId: string) {
    setError(null);
    try {
      // The owner's view of a quiz includes the correct answers, so it can be edited.
      const q = await api<ServerQuiz>(`/quizzes/${quizId}`);
      setDraft({
        id: q.id,
        title: q.title,
        passMark: q.passMark,
        minutes: Math.max(1, Math.round(q.timeLimitSeconds / 60)),
        attempts: q.maxAttempts,
        questions: q.questions.map((x) => ({
          id: x.id,
          type: x.type,
          prompt: x.prompt,
          options: x.type === "true_false" ? [] : x.options.map((o) => o.text),
          correctIndex: Math.max(
            0,
            x.options.findIndex((o) => o.id === x.correctOptionId),
          ),
        })),
      });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function save(d: QuizDraft) {
    setError(null);
    const body = {
      title: d.title.trim(),
      passMark: d.passMark,
      maxAttempts: d.attempts,
      timeLimitSeconds: d.minutes * 60,
      questions: d.questions.map((q) => ({
        ...(q.id ? { id: q.id } : {}),
        type: q.type,
        prompt: q.prompt.trim(),
        options: q.type === "true_false" ? [] : q.options.map((o) => o.trim()).filter(Boolean),
        correctIndex: q.correctIndex,
      })),
    };
    try {
      await send(d.id ? "PUT" : "POST", d.id ? `/quizzes/${d.id}` : `/courses/${courseId}/quizzes`, body);
      setDraft(null);
      quizzes.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <section aria-labelledby="quizzes" className="space-y-3">
      <h2 id="quizzes" className="text-lg font-semibold">
        Quizzes
      </h2>
      {!draft && error && <Alert tone="danger">{error}</Alert>}
      {quizzes.data?.map((q) => (
        <Card key={q.id} className="flex items-center justify-between gap-2 py-3">
          <div>
            <p className="font-medium">{q.title}</p>
            <p className="text-sm text-muted-foreground">
              {q.questionCount} questions, {Math.round(q.timeLimitSeconds / 60)} min, pass mark {q.passMark}%, {q.maxAttempts} attempts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void edit(q.id)}>
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Button>
        </Card>
      ))}
      {quizzes.data?.length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet.</p>}

      {!draft ? (
        <Button variant="outline" onClick={() => setDraft(blankDraft())}>
          <Plus className="h-4 w-4" aria-hidden /> New quiz
        </Button>
      ) : (
        <QuizForm
          key={draft.id ?? "new"}
          initial={draft}
          error={error}
          onSave={save}
          onCancel={() => {
            setDraft(null);
            setError(null);
          }}
        />
      )}
    </section>
  );
}

function QuizForm({
  initial,
  error,
  onSave,
  onCancel,
}: {
  initial: QuizDraft;
  error: string | null;
  onSave: (d: QuizDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [d, setD] = useState<QuizDraft>(initial);
  const [busy, setBusy] = useState(false);
  const editing = !!initial.id;

  const setQ = (i: number, patch: Partial<Q>) => setD({ ...d, questions: d.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) });

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSave(d);
          setBusy(false);
        }}
      >
        <h3 className="font-medium">{editing ? "Edit quiz" : "New quiz"}</h3>
        {error && <Alert tone="danger">{error}</Alert>}
        {editing && <Alert tone="info">Changes apply to future attempts. Past scores are kept as they were.</Alert>}
        <Field label="Quiz title" htmlFor="qz-title">
          <Input id="qz-title" required minLength={2} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Pass mark (%)" htmlFor="qz-pass">
            <Input
              id="qz-pass"
              type="number"
              min={1}
              max={100}
              value={d.passMark}
              onChange={(e) => setD({ ...d, passMark: Number(e.target.value) })}
            />
          </Field>
          <Field label="Time limit (min)" htmlFor="qz-time">
            <Input
              id="qz-time"
              type="number"
              min={1}
              max={180}
              value={d.minutes}
              onChange={(e) => setD({ ...d, minutes: Number(e.target.value) })}
            />
          </Field>
          <Field label="Max attempts" htmlFor="qz-att">
            <Input
              id="qz-att"
              type="number"
              min={1}
              max={20}
              value={d.attempts}
              onChange={(e) => setD({ ...d, attempts: Number(e.target.value) })}
            />
          </Field>
        </div>

        {d.questions.map((q, i) => (
          <fieldset key={q.id ?? i} className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium">Question {i + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <Field label="Prompt" htmlFor={`qp-${i}`}>
                <Input id={`qp-${i}`} required minLength={3} value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} />
              </Field>
              <Field label="Type" htmlFor={`qt-${i}`}>
                <Select
                  id={`qt-${i}`}
                  value={q.type}
                  onChange={(e) => {
                    const type = e.target.value as Q["type"];
                    setQ(i, {
                      type,
                      correctIndex: 0,
                      options: type === "multiple_choice" && q.options.length < 2 ? ["", "", "", ""] : q.options,
                    });
                  }}
                >
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="true_false">True / false</option>
                </Select>
              </Field>
            </div>
            {q.type === "true_false" ? (
              <div className="flex gap-4 text-sm">
                {["True", "False"].map((label, idx) => (
                  <label key={label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctIndex === idx}
                      onChange={() => setQ(i, { correctIndex: idx })}
                    />{" "}
                    {label} is correct
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {q.options.map((o, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      aria-label={`Option ${idx + 1} is correct`}
                      checked={q.correctIndex === idx}
                      onChange={() => setQ(i, { correctIndex: idx })}
                    />
                    <Input
                      aria-label={`Option ${idx + 1}`}
                      placeholder={`Option ${idx + 1}`}
                      value={o}
                      onChange={(e) => setQ(i, { options: q.options.map((x, k) => (k === idx ? e.target.value : x)) })}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  {q.options.length < 8 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setQ(i, { options: [...q.options, ""] })}>
                      Add option
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer. Empty options are ignored.
                  </p>
                </div>
              </div>
            )}
            {d.questions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setD({ ...d, questions: d.questions.filter((_, k) => k !== i) })}
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Remove question
              </Button>
            )}
          </fieldset>
        ))}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setD({ ...d, questions: [...d.questions, blankQuestion()] })}>
            <Plus className="h-4 w-4" aria-hidden /> Add question
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : editing ? "Save changes" : "Save quiz"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
