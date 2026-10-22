import { CourseEditor } from "@/features/instructor/course-editor";

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}
