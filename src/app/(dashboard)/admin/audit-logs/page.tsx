"use client";

import { DataTable, Td } from "@/components/ui/data-table";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Paginated } from "@/types";

interface Log {
  id: string;
  when: string;
  actor: string;
  action: string;
  target: string;
}

export default function AuditLogsPage() {
  const { data, error, loading } = useApi<Paginated<Log>>("/admin/audit-logs?pageSize=50");
  return (
    <>
      <PageHeader title="Audit logs" description="Important administrative actions. Secrets are never recorded." />
      <Query loading={loading} error={error}>
        {data?.items.length === 0 ? (
          <EmptyState title="No activity recorded yet" />
        ) : (
          <DataTable caption="Audit log" columns={["When", "Actor", "Action", "Target"]}>
            {data?.items.map((l) => (
              <tr key={l.id}>
                <Td>{new Date(l.when).toLocaleString()}</Td>
                <Td>{l.actor}</Td>
                <Td className="font-mono text-xs">{l.action}</Td>
                <Td>{l.target}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Query>
    </>
  );
}
