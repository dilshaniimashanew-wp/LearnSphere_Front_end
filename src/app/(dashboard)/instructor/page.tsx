"use client";

import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";

interface Analytics {
  courses: number;
  pendingReview: number;
  students: number;
  toGrade: number;
  completionRate: number;
}

export default function InstructorDashboard() {
  const { data, error, loading } = useApi<Analytics>("/instructor/analytics");
  return (
    <>
      <PageHeader
        title="Instructor dashboard"
        description="Your courses and student activity."
        action={<ButtonLink href="/instructor/courses/new">New course</ButtonLink>}
      />
      <Query loading={loading} error={error}>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Courses"
                value={data.courses}
                hint={data.pendingReview ? `${data.pendingReview} pending review` : undefined}
              />
              <StatCard label="Enrollments" value={data.students} />
              <StatCard label="To grade" value={data.toGrade} />
              <StatCard label="Avg. completion" value={`${data.completionRate}%`} />
            </div>
            <h2 className="mb-3 mt-8 text-lg font-semibold">Needs attention</h2>
            <Card>
              <p className="text-sm text-muted-foreground">
                {data.toGrade > 0
                  ? `${data.toGrade} submission${data.toGrade === 1 ? " is" : "s are"} waiting for grading.`
                  : "Nothing is waiting for grading."}
              </p>
              <div className="mt-3">
                <ButtonLink href="/instructor/submissions" variant="outline" size="sm">
                  Open submissions
                </ButtonLink>
              </div>
            </Card>
          </>
        )}
      </Query>
    </>
  );
}
