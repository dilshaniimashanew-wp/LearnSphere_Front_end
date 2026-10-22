"use client";

import { ButtonLink } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { Badge, EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Course, CourseStatus } from "@/types";

const tone: Record<CourseStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  rejected: "danger",
  archived: "neutral",
};

export default function InstructorCoursesPage() {
  const { data, error, loading } = useApi<Course[]>("/courses/mine");
  return (
    <>
      <PageHeader title="My courses" action={<ButtonLink href="/instructor/courses/new">New course</ButtonLink>} />
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="You have not created a course" action={<ButtonLink href="/instructor/courses/new">Create your first course</ButtonLink>} />
        ) : (
          <DataTable caption="Your courses" columns={["Course", "Status", "Lessons", "Students", "Actions"]}>
            {data?.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.title}</Td>
                <Td>
                  <Badge tone={tone[c.status]}>{c.status.replace("_", " ")}</Badge>
                </Td>
                <Td>{c.lessonCount}</Td>
                <Td>{c.students}</Td>
                <Td>
                  <ButtonLink href={`/instructor/courses/${c.id}`} variant="outline" size="sm">
                    Manage
                  </ButtonLink>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Query>
    </>
  );
}
