import { Badge, PageHeader } from "@/components/ui/feedback";
import { DataTable, Td } from "@/components/ui/data-table";

const grades = [
  { id: "g1", item: "Quiz: Routing basics", course: "Modern Web Development with Next.js", score: "8 / 10", passed: true },
  { id: "g2", item: "Data cleaning report", course: "Data Analysis with Python", score: "86 / 100", passed: true },
  { id: "g3", item: "Quiz: Pandas basics", course: "Data Analysis with Python", score: "4 / 10", passed: false },
];

export default function GradesPage() {
  return (
    <>
      <PageHeader title="Grades" description="Quiz results and assignment marks." />
      <DataTable caption="Your grades" columns={["Item", "Course", "Score", "Result"]}>
        {grades.map((g) => (
          <tr key={g.id}>
            <Td className="font-medium">{g.item}</Td>
            <Td>{g.course}</Td>
            <Td>{g.score}</Td>
            <Td>
              <Badge tone={g.passed ? "success" : "danger"}>{g.passed ? "passed" : "failed"}</Badge>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
