"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, EmptyState, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Course } from "@/types";

interface Enrollment {
  courseId: string;
  course: Course;
  status: "active" | "completed";
  progress: number;
  nextLesson: string;
}

export default function MyCoursesPage() {
  const { data, error, loading } = useApi<Enrollment[]>("/enrollments/me");
  return (
    <>
      <PageHeader title="My courses" description="Courses you are enrolled in." />
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="You have not enrolled in any course" action={<ButtonLink href="/courses">Browse courses</ButtonLink>} />
        ) : (
          <div className="space-y-3">
            {data?.map((e) => (
              <Card key={e.courseId} className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/student/courses/${e.courseId}`} className="font-medium hover:text-primary">
                      {e.course.title}
                    </Link>
                    <Badge tone={e.status === "completed" ? "success" : "info"}>{e.status}</Badge>
                  </div>
                  <ProgressBar value={e.progress} label={`${e.course.title} progress`} />
                  <p className="text-sm text-muted-foreground">
                    {e.progress}% complete{e.nextLesson && `. Next: ${e.nextLesson}`}
                  </p>
                </div>
                <ButtonLink href={`/student/courses/${e.courseId}`} variant="outline" size="sm">
                  {e.status === "completed" ? "Review" : "Continue"}
                </ButtonLink>
              </Card>
            ))}
          </div>
        )}
      </Query>
    </>
  );
}
