import { ButtonLink } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { Badge, PageHeader } from "@/components/ui/feedback";
import type { CourseStatus } from "@/types";

const tone: Record<CourseStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  rejected: "danger",
  archived: "neutral",
};

const rows: { id: string; title: string; status: CourseStatus; students: number }[] = [
  { id: "c1", title: "Modern Web Development with Next.js", status: "published", students: 1280 },
  { id: "c5", title: "Advanced TypeScript", status: "pending_review", students: 0 },
  { id: "c6", title: "Testing React Apps", status: "draft", students: 0 },
];

export default function InstructorCoursesPage() {
  return (
    <>
      <PageHeader title="My courses" action={<ButtonLink href="/instructor/courses/new">New course</ButtonLink>} />
      <DataTable caption="Your courses" columns={["Course", "Status", "Students", "Actions"]}>
        {rows.map((c) => (
          <tr key={c.id}>
            <Td className="font-medium">{c.title}</Td>
            <Td>
              <Badge tone={tone[c.status]}>{c.status.replace("_", " ")}</Badge>
            </Td>
            <Td>{c.students}</Td>
            <Td>
              <ButtonLink href={`/instructor/courses/${c.id}`} variant="outline" size="sm">
                Edit
              </ButtonLink>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
