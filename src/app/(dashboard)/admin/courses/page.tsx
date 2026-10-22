"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { pendingCourses } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function CourseApprovalsPage() {
  const [rows, setRows] = useState(pendingCourses);

  // Local only; becomes PATCH /admin/courses/:id/approve|reject with a moderation note.
  const resolve = (id: string) => setRows((r) => r.filter((c) => c.id !== id));

  return (
    <>
      <PageHeader title="Course approvals" description="Review courses submitted by instructors." />
      {rows.length === 0 ? (
        <EmptyState title="Nothing to review" description="New submissions will appear here." />
      ) : (
        <DataTable caption="Courses pending review" columns={["Course", "Instructor", "Submitted", "Actions"]}>
          {rows.map((c) => (
            <tr key={c.id}>
              <Td className="font-medium">{c.title}</Td>
              <Td>{c.instructor}</Td>
              <Td>{formatDate(c.submitted)}</Td>
              <Td className="space-x-2">
                <Button size="sm" onClick={() => resolve(c.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => resolve(c.id)}>
                  Reject
                </Button>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
