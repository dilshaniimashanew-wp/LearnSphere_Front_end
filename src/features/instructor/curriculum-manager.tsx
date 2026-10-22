"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { errorMessage, send } from "@/lib/use-api";
import type { Course } from "@/types";

export function CurriculumManager({ course, onChanged }: { course: Course; onChanged: () => void }) {
  const [moduleTitle, setModuleTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <section aria-labelledby="curriculum" className="space-y-4">
      <h2 id="curriculum" className="text-lg font-semibold">
        Curriculum
      </h2>
      {error && <Alert tone="danger">{error}</Alert>}

      {course.modules?.map((m, i) => (
        <Card key={m.id} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">
              Module {i + 1}: {m.title}
            </h3>
            <Button variant="ghost" size="sm" aria-label={`Delete module ${m.title}`} onClick={() => window.confirm(`Delete "${m.title}" and its lessons?`) && void run(() => send("DELETE", `/modules/${m.id}`))}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {m.lessons.length === 0 && <li className="px-3 py-2 text-muted-foreground">No lessons yet.</li>}
            {m.lessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-3 py-2">
                <span>
                  {l.title} <span className="text-muted-foreground">({l.type}, {l.minutes}m)</span>
                </span>
                <Button variant="ghost" size="sm" aria-label={`Delete lesson ${l.title}`} onClick={() => window.confirm(`Delete lesson "${l.title}"?`) && void run(() => send("DELETE", `/lessons/${l.id}`))}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
          <LessonForm moduleId={m.id} onAdd={(body) => run(() => send("POST", `/modules/${m.id}/lessons`, body))} />
        </Card>
      ))}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (moduleTitle.trim().length < 2) return;
          void run(() => send("POST", `/courses/${course.id}/modules`, { title: moduleTitle.trim() }).then(() => setModuleTitle("")));
        }}
      >
        <Input aria-label="New module title" placeholder="New module title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
        <Button type="submit" variant="outline">
          Add module
        </Button>
      </form>
    </section>
  );
}

function LessonForm({ moduleId, onAdd }: { moduleId: string; onAdd: (body: Record<string, unknown>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"text" | "video">("text");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [minutes, setMinutes] = useState(10);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add lesson
      </Button>
    );
  }
  return (
    <form
      className="space-y-3 rounded-lg border border-border p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onAdd({ title: title.trim(), type, content, videoUrl: videoUrl.trim() || undefined, estimatedMinutes: minutes });
        setTitle("");
        setContent("");
        setVideoUrl("");
        setOpen(false);
      }}
    >
      <Field label="Lesson title" htmlFor={`lt-${moduleId}`}>
        <Input id={`lt-${moduleId}`} required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type" htmlFor={`ly-${moduleId}`}>
          <Select id={`ly-${moduleId}`} value={type} onChange={(e) => setType(e.target.value as "text" | "video")}>
            <option value="text">Text</option>
            <option value="video">Video</option>
          </Select>
        </Field>
        <Field label="Minutes" htmlFor={`lm-${moduleId}`}>
          <Input id={`lm-${moduleId}`} type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 1)} />
        </Field>
      </div>
      {type === "video" && (
        <Field label="Video URL" htmlFor={`lv-${moduleId}`}>
          <Input id={`lv-${moduleId}`} type="url" placeholder="https://www.youtube.com/embed/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        </Field>
      )}
      <Field label="Content" htmlFor={`lc-${moduleId}`}>
        <Textarea id={`lc-${moduleId}`} rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save lesson
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
