import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui/feedback";
import { enrollments, getCourseById, upcomingWork } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function StudentDashboard() {
  const active = enrollments.filter((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed");

  return (
    <>
      <PageHeader title="Dashboard" description="Pick up where you left off." action={<ButtonLink href="/courses">Find courses</ButtonLink>} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active courses" value={active.length} />
        <StatCard label="Completed" value={completed.length} />
        <StatCard label="Due soon" value={upcomingWork.length} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Continue learning</h2>
      {active.length === 0 ? (
        <EmptyState title="No active courses" description="Enroll in a course to start learning." action={<ButtonLink href="/courses">Browse courses</ButtonLink>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((e) => {
            const course = getCourseById(e.courseId);
            if (!course) return null;
            return (
              <Card key={e.courseId} className="space-y-3">
                <Link href={`/student/courses/${course.id}`} className="font-medium hover:text-primary">
                  {course.title}
                </Link>
                <ProgressBar value={e.progress} label={`${course.title} progress`} />
                <p className="text-sm text-muted-foreground">
                  {e.progress}% complete. Next: {e.nextLesson}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold">Upcoming work</h2>
      <ul className="space-y-2">
        {upcomingWork.map((w) => (
          <li key={w.id}>
            <Card className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{w.title}</p>
                <p className="text-sm text-muted-foreground">{w.course}</p>
              </div>
              <span className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" aria-hidden /> {formatDate(w.due)}
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
