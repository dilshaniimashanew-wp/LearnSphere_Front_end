"use client";

import { AssignmentCard } from "@/features/assignments/assignment-card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Assignment } from "@/types";

export default function StudentAssignmentsPage() {
  const { data, error, loading, reload } = useApi<Assignment[]>("/assignments/me");
  return (
    <>
      <PageHeader title="Assignments" description="Submit work and track your submission history." />
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="No assignments yet" description="Assignments from your enrolled courses appear here." />
        ) : (
          <div className="space-y-3">
            {data?.map((a) => (
              <AssignmentCard key={a.id} assignment={a} onChanged={reload} />
            ))}
          </div>
        )}
      </Query>
    </>
  );
}
