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
import { api } from "@/lib/api";
import { categories } from "@/lib/mock-data";

const courseSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters").max(240),
  description: z.string().trim().min(30, "Describe the course in at least 30 characters"),
  category: z.string().min(1, "Choose a category"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  objectives: z.string().trim().min(1, "Add at least one objective (one per line)"),
});

type CourseValues = z.infer<typeof courseSchema>;

export function CourseForm({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseValues>({ resolver: zodResolver(courseSchema), defaultValues: { level: "beginner" } });

  async function onSubmit(values: CourseValues) {
    const payload = { ...values, objectives: values.objectives.split("\n").map((s) => s.trim()).filter(Boolean) };
    try {
      await api(courseId ? `/courses/${courseId}` : "/courses", {
        method: courseId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      router.push("/instructor/courses");
    } catch {
      setMessage({ tone: "danger", text: "Could not save the course. Is the API running?" });
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
          <Field label="Category" htmlFor="category" error={errors.category?.message}>
            <Select id="category" defaultValue="" {...register("category")}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
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
        <Field label="Learning objectives (one per line)" htmlFor="objectives" error={errors.objectives?.message}>
          <Textarea id="objectives" rows={4} aria-invalid={!!errors.objectives} {...register("objectives")} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save draft"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
