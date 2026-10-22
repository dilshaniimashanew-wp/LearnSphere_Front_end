"use client";

import { Card, StatCard } from "@/components/ui/card";
import { Badge, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";

interface Analytics {
  students: number;
  completionRate: number;
  avgQuizScore: number;
  toGrade: number;
  perCourse: { id: string; title: string; status: string; students: number; completion: number }[];
}

export default function InstructorAnalyticsPage() {
  const { data, error, loading } = useApi<Analytics>("/instructor/analytics");
  return (
    <>
      <PageHeader title="Analytics" description="Reports for courses you own." />
      <Query loading={loading} error={error}>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Enrollments" value={data.students} />
              <StatCard label="Completion rate" value={`${data.completionRate}%`} />
              <StatCard label="Avg. quiz score" value={`${data.avgQuizScore}%`} />
            </div>
            <h2 className="mb-3 mt-8 text-lg font-semibold">Completion by course</h2>
            <div className="space-y-3">
              {data.perCourse.map((c) => (
                <Card key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{c.title}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Badge>{c.status.replace("_", " ")}</Badge> {c.students} students
                    </span>
                  </div>
                  <ProgressBar value={c.completion} label={`${c.title} completion`} />
                </Card>
              ))}
            </div>
          </>
        )}
      </Query>
    </>
  );
}
