import { Card, StatCard } from "@/components/ui/card";
import { PageHeader, ProgressBar } from "@/components/ui/feedback";

const perCourse = [
  { title: "Modern Web Development with Next.js", completion: 68, students: 1280 },
  { title: "Advanced TypeScript", completion: 0, students: 0 },
];

export default function InstructorAnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Reports for courses you own." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrollments" value={1280} />
        <StatCard label="Completion rate" value="68%" />
        <StatCard label="Avg. quiz score" value="74%" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Completion by course</h2>
      <div className="space-y-3">
        {perCourse.map((c) => (
          <Card key={c.title} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{c.title}</span>
              <span className="text-muted-foreground">{c.students} students</span>
            </div>
            <ProgressBar value={c.completion} label={`${c.title} completion`} />
          </Card>
        ))}
      </div>
    </>
  );
}
