import { PageHeader } from "@/components/ui/feedback";
import { CourseForm } from "@/features/courses/course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return (
    <>
      <PageHeader title="Edit course" description="Module, lesson, quiz and assignment editors will be added here." />
      <CourseForm courseId={courseId} />
    </>
  );
}
