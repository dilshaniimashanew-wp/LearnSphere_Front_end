"use client";

import { useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { errorMessage, send, useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

/** Students read announcements; the course owner can also post and delete them. */
export function AnnouncementsPanel({ courseId, canPost = false }: { courseId: string; canPost?: boolean }) {
  const { data, reload } = useApi<Announcement[]>(`/courses/${courseId}/announcements`);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await send("POST", `/courses/${courseId}/announcements`, { title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section aria-labelledby="announcements" className="space-y-3">
      <h2 id="announcements" className="flex items-center gap-2 text-lg font-semibold">
        <Megaphone className="h-5 w-5" aria-hidden /> Announcements
      </h2>

      {canPost && (
        <Card>
          <form onSubmit={post} className="space-y-3">
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="Title" htmlFor="an-title">
              <Input id="an-title" required minLength={2} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Message to enrolled students" htmlFor="an-body">
              <Textarea id="an-body" required minLength={2} rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            <Button type="submit" size="sm">
              Post announcement
            </Button>
          </form>
        </Card>
      )}

      {data?.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
      <ul className="space-y-2">
        {data?.map((a) => (
          <li key={a.id}>
            <Card className="space-y-1 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{a.title}</p>
                {canPost && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete announcement ${a.title}`}
                    onClick={() =>
                      window.confirm("Delete this announcement?") && void send("DELETE", `/announcements/${a.id}`).then(reload)
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{a.body}</p>
              <p className="text-xs text-muted-foreground">
                {a.author} &middot; {formatDate(a.createdAt)}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
