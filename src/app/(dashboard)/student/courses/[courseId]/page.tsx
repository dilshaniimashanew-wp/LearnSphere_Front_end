import { LessonPlayer } from "@/features/learning/lesson-player";

export default async function LessonPlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <LessonPlayer courseId={courseId} />;
}
