import { Badge, PageHeader } from "@/components/ui/feedback";
import { DataTable, Td } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

const items = [
  { id: "a1", title: "Build a form", course: "Modern Web Development with Next.js", due: "2026-10-30", status: "not submitted" },
  { id: "a2", title: "Data cleaning report", course: "Data Analysis with Python", due: "2026-10-12", status: "graded" },
];

export default function StudentAssignmentsPage() {
  return (
    <>
      <PageHeader title="Assignments" description="Submit work and track your submission history." />
      <DataTable caption="Your assignments" columns={["Assignment", "Course", "Due", "Status"]}>
        {items.map((a) => (
          <tr key={a.id}>
            <Td className="font-medium">{a.title}</Td>
            <Td>{a.course}</Td>
            <Td>{formatDate(a.due)}</Td>
            <Td>
              <Badge tone={a.status === "graded" ? "success" : "warning"}>{a.status}</Badge>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
