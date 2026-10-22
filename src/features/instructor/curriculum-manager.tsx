"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { moved } from "@/lib/reorder";
import { errorMessage, send } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

type Drag = { kind: "module"; id: string } | { kind: "lesson"; id: string } | null;

export function CurriculumManager({ course, onChanged }: { course: Course; onChanged: () => void }) {
  const [moduleTitle, setModuleTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag>(null);
  const [over, setOver] = useState<string | null>(null);

  const modules = course.modules ?? [];

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  const reorderModules = (ids: string[]) => run(() => send("PATCH", `/courses/${course.id}/modules/reorder`, { moduleIds: ids }));
  const reorderLessons = (moduleId: string, ids: string[]) => run(() => send("PATCH", `/modules/${moduleId}/lessons/reorder`, { lessonIds: ids }));

  function endDrag() {
    setDrag(null);
    setOver(null);
  }

  function dropOnModule(targetModuleId: string) {
    if (!drag) return;
    if (drag.kind === "module") {
      void reorderModules(moved(modules.map((m) => m.id), drag.id, targetModuleId));
    } else {
      // A lesson dropped on a module card (not on a specific lesson) goes to the end of that module.
      const target = modules.find((m) => m.id === targetModuleId);
      if (target) void reorderLessons(targetModuleId, moved(target.lessons.map((l) => l.id), drag.id));
    }
    endDrag();
  }

  function dropOnLesson(targetModuleId: string, targetLessonId: string) {
    if (drag?.kind !== "lesson") return;
    const target = modules.find((m) => m.id === targetModuleId);
    if (target) void reorderLessons(targetModuleId, moved(target.lessons.map((l) => l.id), drag.id, targetLessonId));
    endDrag();
  }

  return (
    <section aria-labelledby="curriculum" className="space-y-4">
      <div>
        <h2 id="curriculum" className="text-lg font-semibold">
          Curriculum
        </h2>
        <p className="text-sm text-muted-foreground">Drag the grip handle to reorder modules and lessons (lessons can move between modules), or use the arrow buttons.</p>
      </div>
      {error && <Alert tone="danger">{error}</Alert>}

      {modules.map((m, i) => (
        <Card
          key={m.id}
          className={cn("space-y-3", over === m.id && drag && "border-primary ring-2 ring-primary/30")}
          onDragOver={(e) => {
            if (drag) {
              e.preventDefault();
              setOver(m.id);
            }
          }}
          onDragLeave={() => setOver((o) => (o === m.id ? null : o))}
          onDrop={(e) => {
            e.preventDefault();
            dropOnModule(m.id);
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                role="img"
                aria-label={`Drag module ${m.title}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDrag({ kind: "module", id: m.id });
                }}
                onDragEnd={endDrag}
                className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="font-medium">
                Module {i + 1}: {m.title}
              </h3>
            </div>
            <div className="flex">
              <Button variant="ghost" size="sm" aria-label={`Move module ${m.title} up`} disabled={i === 0} onClick={() => void reorderModules(moved(modules.map((x) => x.id), m.id, modules[i - 1].id))}>
                <ArrowUp className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Move module ${m.title} down`} disabled={i === modules.length - 1} onClick={() => void reorderModules(moved(modules.map((x) => x.id), modules[i + 1].id, m.id))}>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Delete module ${m.title}`} onClick={() => window.confirm(`Delete "${m.title}" and its lessons?`) && void run(() => send("DELETE", `/modules/${m.id}`))}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {m.lessons.length === 0 && <li className="px-3 py-2 text-muted-foreground">No lessons yet. Drop a lesson here.</li>}
            {m.lessons.map((l, li) => (
              <li
                key={l.id}
                onDragOver={(e) => {
                  if (drag?.kind === "lesson") {
                    e.preventDefault();
                    e.stopPropagation();
                    setOver(l.id);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dropOnLesson(m.id, l.id);
                }}
                className={cn("flex items-center justify-between gap-2 px-3 py-2", over === l.id && drag?.kind === "lesson" && "bg-accent", drag?.id === l.id && "opacity-50")}
              >
                <span className="flex items-center gap-2">
                  <span
                    role="img"
                    aria-label={`Drag lesson ${l.title}`}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = "move";
                      setDrag({ kind: "lesson", id: l.id });
                    }}
                    onDragEnd={endDrag}
                    className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    {l.title} <span className="text-muted-foreground">({l.type}, {l.minutes}m)</span>
                  </span>
                </span>
                <span className="flex">
                  <Button variant="ghost" size="sm" aria-label={`Move lesson ${l.title} up`} disabled={li === 0} onClick={() => void reorderLessons(m.id, moved(m.lessons.map((x) => x.id), l.id, m.lessons[li - 1].id))}>
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Move lesson ${l.title} down`} disabled={li === m.lessons.length - 1} onClick={() => void reorderLessons(m.id, moved(m.lessons.map((x) => x.id), m.lessons[li + 1].id, l.id))}>
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete lesson ${l.title}`} onClick={() => window.confirm(`Delete lesson "${l.title}"?`) && void run(() => send("DELETE", `/lessons/${l.id}`))}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </span>
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
