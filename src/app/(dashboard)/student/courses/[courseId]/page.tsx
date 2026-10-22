import { notFound } from "next/navigation";
import { LessonPlayer } from "@/features/learning/lesson-player";
import { getCourseById } from "@/lib/mock-data";

export default async function LessonPlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();
  return <LessonPlayer course={course} />;
}
