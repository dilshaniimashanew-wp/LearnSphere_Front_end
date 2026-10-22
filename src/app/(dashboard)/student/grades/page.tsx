"use client";

import { DataTable, Td } from "@/components/ui/data-table";
import { Badge, EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";

interface Grade {
  id: string;
  kind: "quiz" | "assignment";
  item: string;
  course: string;
  score: string;
  passed: boolean;
  feedback?: string;
}

export default function GradesPage() {
  const { data, error, loading } = useApi<Grade[]>("/grades/me");
  return (
    <>
      <PageHeader title="Grades" description="Quiz results and assignment marks." />
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="No grades yet" description="Results appear after you take a quiz or an instructor grades your work." />
        ) : (
          <DataTable caption="Your grades" columns={["Item", "Course", "Score", "Result", "Feedback"]}>
            {data?.map((g) => (
              <tr key={`${g.kind}-${g.id}`}>
                <Td className="font-medium">{g.item}</Td>
                <Td>{g.course}</Td>
                <Td>{g.score}</Td>
                <Td>
                  <Badge tone={g.passed ? "success" : "danger"}>{g.passed ? "passed" : "not passed"}</Badge>
                </Td>
                <Td className="text-muted-foreground">{g.feedback ?? ""}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Query>
    </>
  );
}
