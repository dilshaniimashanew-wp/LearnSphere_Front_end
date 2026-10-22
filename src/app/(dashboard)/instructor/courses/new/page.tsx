import { PageHeader } from "@/components/ui/feedback";
import { CourseForm } from "@/features/courses/course-form";

export default function NewCoursePage() {
  return (
    <>
      <PageHeader title="Create course" description="Save as a draft, then add modules and lessons and submit for review." />
      <CourseForm />
    </>
  );
}
