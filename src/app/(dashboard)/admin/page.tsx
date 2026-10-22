import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { pendingCourses } from "@/lib/mock-data";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Platform overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value="2,418" />
        <StatCard label="Courses" value={86} hint={`${pendingCourses.length} awaiting approval`} />
        <StatCard label="Enrollments" value="9,320" />
        <StatCard label="Completion rate" value="54%" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Pending approvals</h2>
      <Card className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{pendingCourses.length} courses are waiting for review.</p>
        <ButtonLink href="/admin/courses" variant="outline" size="sm">
          Review
        </ButtonLink>
      </Card>
    </>
  );
}
