"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { Category, Course } from "@/types";

const courseSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters").max(240),
  description: z.string().trim().min(30, "Describe the course in at least 30 characters"),
  categoryId: z.string().min(1, "Choose a category"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  objectives: z.string(),
  prerequisites: z.string(),
  thumbnailUrl: z.union([z.literal(""), z.string().trim().url("Enter a full image URL, e.g. https://...")]),
});

type CourseValues = z.infer<typeof courseSchema>;
const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

export function CourseForm({ course, onSaved }: { course?: Course; onSaved?: () => void }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/categories");
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      summary: course?.summary ?? "",
      description: course?.description ?? "",
      categoryId: course?.categoryId ?? "",
      level: course?.level ?? "beginner",
      objectives: course?.objectives.join("\n") ?? "",
      prerequisites: course?.prerequisites.join("\n") ?? "",
      thumbnailUrl: course?.thumbnailUrl ?? "",
    },
  });

  async function onSubmit(values: CourseValues) {
    // An empty thumbnail URL clears it, so the generated banner is used instead.
    const payload = {
      ...values,
      objectives: lines(values.objectives),
      prerequisites: lines(values.prerequisites),
      thumbnailUrl: values.thumbnailUrl || null,
    };
    try {
      if (course) {
        await send("PATCH", `/courses/${course.id}`, payload);
        setMessage({ tone: "success", text: "Course details saved." });
        onSaved?.();
      } else {
        const created = await send<Course>("POST", "/courses", payload);
        router.push(`/instructor/courses/${created.id}`);
      }
    } catch (e) {
      setMessage({ tone: "danger", text: errorMessage(e) });
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Field label="Title" htmlFor="title" error={errors.title?.message}>
          <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
        </Field>
        <Field label="Short summary" htmlFor="summary" error={errors.summary?.message}>
          <Input id="summary" aria-invalid={!!errors.summary} {...register("summary")} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={5} aria-invalid={!!errors.description} {...register("description")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
            <Select id="categoryId" {...register("categoryId")}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Level" htmlFor="level" error={errors.level?.message}>
            <Select id="level" {...register("level")}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
        </div>
        <Field label="Banner image URL (optional)" htmlFor="thumbnailUrl" error={errors.thumbnailUrl?.message}>
          <Input
            id="thumbnailUrl"
            type="url"
            placeholder="https://... (leave empty for an automatic banner)"
            aria-invalid={!!errors.thumbnailUrl}
            {...register("thumbnailUrl")}
          />
        </Field>
        <Field label="Learning objectives (one per line)" htmlFor="objectives" error={errors.objectives?.message}>
          <Textarea id="objectives" rows={3} {...register("objectives")} />
        </Field>
        <Field label="Prerequisites (one per line)" htmlFor="prerequisites" error={errors.prerequisites?.message}>
          <Textarea id="prerequisites" rows={2} {...register("prerequisites")} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : course ? "Save changes" : "Create draft"}
          </Button>
          {!course && (
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
