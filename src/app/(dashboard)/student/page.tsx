"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";

interface Summary {
  active: number;
  completed: number;
  dueSoon: number;
  upcoming: { id: string; title: string; course: string; due: string | null; link: string }[];
  progress: { courseId: string; title: string; progress: number }[];
}

export default function StudentDashboard() {
  const { data, error, loading } = useApi<Summary>("/student/summary");
  return (
    <>
      <PageHeader title="Dashboard" description="Pick up where you left off." action={<ButtonLink href="/courses">Find courses</ButtonLink>} />
      <Query loading={loading} error={error}>
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Active courses" value={data.active} />
              <StatCard label="Completed" value={data.completed} />
              <StatCard label="To do" value={data.dueSoon} />
            </div>

            <h2 className="mb-3 mt-8 text-lg font-semibold">Continue learning</h2>
            {data.progress.length === 0 ? (
              <EmptyState title="No active courses" description="Enroll in a course to start learning." action={<ButtonLink href="/courses">Browse courses</ButtonLink>} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.progress.map((p) => (
                  <Card key={p.courseId} className="space-y-3">
                    <Link href={`/student/courses/${p.courseId}`} className="font-medium hover:text-primary">
                      {p.title}
                    </Link>
                    <ProgressBar value={p.progress} label={`${p.title} progress`} />
                    <p className="text-sm text-muted-foreground">{p.progress}% complete</p>
                  </Card>
                ))}
              </div>
            )}

            <h2 className="mb-3 mt-8 text-lg font-semibold">Upcoming work</h2>
            {data.upcoming.length === 0 ? (
              <EmptyState title="You are all caught up" />
            ) : (
              <ul className="space-y-2">
                {data.upcoming.map((w) => (
                  <li key={w.id}>
                    <Card className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <Link href={w.link} className="font-medium hover:text-primary">
                          {w.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{w.course}</p>
                      </div>
                      {w.due && (
                        <span className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
                          <CalendarClock className="h-4 w-4" aria-hidden /> {formatDate(w.due)}
                        </span>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Query>
    </>
  );
}
