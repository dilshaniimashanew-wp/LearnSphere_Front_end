import type { Metadata } from "next";
import { CourseCatalog } from "@/features/courses/course-catalog";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Course catalog</h1>
      <p className="mt-1 text-muted-foreground">Find a published course by keyword, category or level.</p>
      <CourseCatalog />
    </div>
  );
}
