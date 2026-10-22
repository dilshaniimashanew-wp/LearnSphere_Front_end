import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";

export default function InstructorDashboard() {
  return (
    <>
      <PageHeader title="Instructor dashboard" description="Your courses and student activity." action={<ButtonLink href="/instructor/courses/new">New course</ButtonLink>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={3} hint="1 pending review" />
        <StatCard label="Students" value={412} />
        <StatCard label="To grade" value={7} />
        <StatCard label="Avg. completion" value="68%" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Needs attention</h2>
      <Card>
        <p className="text-sm text-muted-foreground">7 submissions are waiting for grading. Review them from the Submissions page.</p>
        <div className="mt-3">
          <ButtonLink href="/instructor/submissions" variant="outline" size="sm">
            Open submissions
          </ButtonLink>
        </div>
      </Card>
    </>
  );
}
