"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { errorMessage, send, useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";
import type { Assignment } from "@/types";

export function AssignmentManager({ courseId }: { courseId: string }) {
  const list = useApi<Assignment[]>(`/courses/${courseId}/assignments`);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [maxPoints, setMaxPoints] = useState(100);
  const [resubmit, setResubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await send("POST", `/courses/${courseId}/assignments`, { title: title.trim(), instructions: instructions.trim(), dueAt: new Date(dueAt).toISOString(), maxPoints, allowResubmission: resubmit });
      setOpen(false);
      setTitle("");
      setInstructions("");
      list.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section aria-labelledby="assignments" className="space-y-3">
      <h2 id="assignments" className="text-lg font-semibold">
        Assignments
      </h2>
      {list.data?.map((a) => (
        <Card key={a.id} className="py-3">
          <p className="font-medium">{a.title}</p>
          <p className="text-sm text-muted-foreground">
            Due {formatDate(a.dueAt)} &middot; {a.maxPoints} points &middot; {a.allowResubmission ? "resubmission allowed" : "single submission"}
          </p>
        </Card>
      ))}
      {list.data?.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}

      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden /> New assignment
        </Button>
      ) : (
        <Card>
          <form onSubmit={save} className="space-y-4">
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="Title" htmlFor="as-title">
              <Input id="as-title" required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Instructions" htmlFor="as-ins">
              <Textarea id="as-ins" required minLength={5} rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Due date" htmlFor="as-due">
                <Input id="as-due" type="datetime-local" required value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              </Field>
              <Field label="Max points" htmlFor="as-pts">
                <Input id="as-pts" type="number" min={1} value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={resubmit} onChange={(e) => setResubmit(e.target.checked)} /> Allow students to resubmit
            </label>
            <div className="flex gap-2">
              <Button type="submit">Create assignment</Button>
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
