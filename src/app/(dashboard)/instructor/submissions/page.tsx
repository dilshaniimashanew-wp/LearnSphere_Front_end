"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, Badge, EmptyState, PageHeader } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";
import type { Paginated, Submission } from "@/types";

type Row = Submission & { studentName: string; assignmentTitle: string; maxPoints: number; course: string };

export default function SubmissionsPage() {
  const [status, setStatus] = useState("submitted");
  const { data, error, loading, reload } = useApi<Paginated<Row>>(`/instructor/submissions?status=${status}`);

  return (
    <>
      <PageHeader title="Submissions" description="Only submissions from your own courses appear here." />
      <div className="mb-4 max-w-xs">
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="submitted">Waiting for grading</option>
          <option value="graded">Graded</option>
          <option value="">All</option>
        </Select>
      </div>
      <Query loading={loading} error={error}>
        {data?.items.length === 0 ? (
          <EmptyState title="No submissions here" />
        ) : (
          <div className="space-y-3">
            {data?.items.map((s) => (
              <SubmissionCard key={s.id} s={s} onGraded={reload} />
            ))}
          </div>
        )}
      </Query>
    </>
  );
}

function SubmissionCard({ s, onGraded }: { s: Row; onGraded: () => void }) {
  const [points, setPoints] = useState(s.grade?.pointsAwarded ?? 0);
  const [feedback, setFeedback] = useState(s.grade?.feedback ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function grade(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await send("PATCH", `/submissions/${s.id}/grade`, { pointsAwarded: points, feedback });
      setMessage({ tone: "success", text: "Grade saved. The student was notified." });
      onGraded();
    } catch (err) {
      setMessage({ tone: "danger", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {s.studentName} &middot; {s.assignmentTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {s.course} &middot; submitted {formatDate(s.submittedAt)} {s.version > 1 && `(version ${s.version})`}
          </p>
        </div>
        <div className="flex gap-2">
          {s.isLate && <Badge tone="warning">late</Badge>}
          <Badge tone={s.status === "graded" ? "success" : "info"}>{s.status}</Badge>
        </div>
      </div>
      {s.textResponse && <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{s.textResponse}</p>}
      {s.fileUrl && (
        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
          Open submitted link
        </a>
      )}
      <form onSubmit={grade} className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <Field label={`Points (max ${s.maxPoints})`} htmlFor={`pts-${s.id}`}>
          <Input
            id={`pts-${s.id}`}
            type="number"
            min={0}
            max={s.maxPoints}
            step="any"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </Field>
        <Field label="Feedback" htmlFor={`fb-${s.id}`}>
          <Textarea id={`fb-${s.id}`} rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </Field>
        <Button type="submit" disabled={busy}>
          {s.status === "graded" ? "Update grade" : "Save grade"}
        </Button>
      </form>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
    </Card>
  );
}
