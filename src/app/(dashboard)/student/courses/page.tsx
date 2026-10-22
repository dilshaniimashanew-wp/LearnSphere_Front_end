import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { enrollments, getCourseById } from "@/lib/mock-data";

export default function MyCoursesPage() {
  return (
    <>
      <PageHeader title="My courses" description="Courses you are enrolled in." />
      <div className="space-y-3">
        {enrollments.map((e) => {
          const course = getCourseById(e.courseId);
          if (!course) return null;
          return (
            <Card key={e.courseId} className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Link href={`/student/courses/${course.id}`} className="font-medium hover:text-primary">
                    {course.title}
                  </Link>
                  <Badge tone={e.status === "completed" ? "success" : "info"}>{e.status}</Badge>
                </div>
                <ProgressBar value={e.progress} label={`${course.title} progress`} />
                <p className="text-sm text-muted-foreground">{e.progress}% complete</p>
              </div>
              <ButtonLink href={`/student/courses/${course.id}`} variant="outline" size="sm">
                {e.status === "completed" ? "Review" : "Continue"}
              </ButtonLink>
            </Card>
          );
        })}
      </div>
    </>
  );
}
