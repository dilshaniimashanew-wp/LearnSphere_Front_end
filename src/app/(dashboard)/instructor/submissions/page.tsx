import { ButtonLink } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { Badge, PageHeader } from "@/components/ui/feedback";
import { formatDate } from "@/lib/utils";

const rows = [
  { id: "s1", student: "Chamod Ekanayake", assignment: "Build a form", submitted: "2026-10-21", late: false },
  { id: "s2", student: "Tharushi Gunawardena", assignment: "Build a form", submitted: "2026-10-22", late: true },
];

export default function SubmissionsPage() {
  return (
    <>
      <PageHeader title="Submissions to grade" description="Only submissions from your own courses appear here." />
      <DataTable caption="Pending submissions" columns={["Student", "Assignment", "Submitted", "Status", "Actions"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="font-medium">{r.student}</Td>
            <Td>{r.assignment}</Td>
            <Td>{formatDate(r.submitted)}</Td>
            <Td>{r.late ? <Badge tone="warning">late</Badge> : <Badge tone="success">on time</Badge>}</Td>
            <Td>
              <ButtonLink href="#" variant="outline" size="sm">
                Grade
              </ButtonLink>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
