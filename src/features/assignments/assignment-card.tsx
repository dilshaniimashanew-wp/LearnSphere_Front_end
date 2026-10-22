"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, Badge } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { errorMessage, send } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";
import type { Assignment } from "@/types";

export function AssignmentCard({ assignment: a, onChanged }: { assignment: Assignment; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(a.submission?.textResponse ?? "");
  const [url, setUrl] = useState(a.submission?.fileUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = a.submission;
  const canSubmit = !s || a.allowResubmission;
  const overdue = new Date(a.dueAt) < new Date();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await send("POST", `/assignments/${a.id}/submissions`, { textResponse: text.trim() || undefined, fileUrl: url.trim() || undefined });
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{a.title}</p>
          {a.course && <p className="text-sm text-muted-foreground">{a.course}</p>}
        </div>
        <div className="flex gap-2">
          {s?.status === "graded" ? (
            <Badge tone="success">graded</Badge>
          ) : s ? (
            <Badge tone="info">submitted</Badge>
          ) : overdue ? (
            <Badge tone="danger">overdue</Badge>
          ) : (
            <Badge tone="warning">not submitted</Badge>
          )}
          {s?.isLate && <Badge tone="warning">late</Badge>}
        </div>
      </div>
      <p className="text-sm">{a.instructions}</p>
      <p className="text-xs text-muted-foreground">
        Due {formatDate(a.dueAt)} &middot; {a.maxPoints} points
      </p>

      {s?.grade && (
        <Alert tone="success">
          Grade: {s.grade.pointsAwarded} / {a.maxPoints}
          {s.grade.feedback && <span className="block">Feedback: {s.grade.feedback}</span>}
        </Alert>
      )}

      {canSubmit && !open && (
        <Button size="sm" variant={s ? "outline" : "primary"} onClick={() => setOpen(true)}>
          {s ? "Resubmit" : "Submit work"}
        </Button>
      )}
      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <Field label="Your response" htmlFor={`text-${a.id}`}>
            <Textarea id={`text-${a.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={4} />
          </Field>
          <Field label="Link to your work (optional)" htmlFor={`url-${a.id}`}>
            <Input id={`url-${a.id}`} type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Submitting..." : "Submit"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
