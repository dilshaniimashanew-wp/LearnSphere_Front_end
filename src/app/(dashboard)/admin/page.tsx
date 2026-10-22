"use client";

import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";

interface Analytics {
  users: number;
  usersByRole: Record<string, number>;
  publishedCourses: number;
  pendingCourses: number;
  enrollments: number;
  completedEnrollments: number;
  completionRate: number;
  quizAttempts: number;
  quizPassRate: number;
  certificates: number;
}

export default function AdminOverviewPage() {
  const { data, error, loading } = useApi<Analytics>("/admin/analytics");
  return (
    <>
      <PageHeader title="Platform overview" />
      <Query loading={loading} error={error}>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Users" value={data.users} hint={`${data.usersByRole.student ?? 0} students, ${data.usersByRole.instructor ?? 0} instructors`} />
              <StatCard label="Published courses" value={data.publishedCourses} hint={`${data.pendingCourses} awaiting approval`} />
              <StatCard label="Enrollments" value={data.enrollments} hint={`${data.completedEnrollments} completed`} />
              <StatCard label="Completion rate" value={`${data.completionRate}%`} />
              <StatCard label="Quiz attempts" value={data.quizAttempts} hint={`${data.quizPassRate}% pass rate`} />
              <StatCard label="Certificates issued" value={data.certificates} />
            </div>
            <h2 className="mb-3 mt-8 text-lg font-semibold">Pending approvals</h2>
            <Card className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{data.pendingCourses} course{data.pendingCourses === 1 ? " is" : "s are"} waiting for review.</p>
              <ButtonLink href="/admin/courses" variant="outline" size="sm">
                Review
              </ButtonLink>
            </Card>
          </>
        )}
      </Query>
    </>
  );
}
