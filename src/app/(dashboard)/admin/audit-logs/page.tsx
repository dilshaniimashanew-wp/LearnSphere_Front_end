import { DataTable, Td } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/feedback";

const logs = [
  { id: "l1", when: "2026-10-22 09:14", actor: "Demo Admin", action: "course.approve", target: "Modern Web Development with Next.js" },
  { id: "l2", when: "2026-10-21 16:02", actor: "Demo Admin", action: "user.suspend", target: "tharushi@example.com" },
];

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader title="Audit logs" description="Important administrative actions. Secrets are never recorded." />
      <DataTable caption="Audit log" columns={["When", "Actor", "Action", "Target"]}>
        {logs.map((l) => (
          <tr key={l.id}>
            <Td>{l.when}</Td>
            <Td>{l.actor}</Td>
            <Td className="font-mono text-xs">{l.action}</Td>
            <Td>{l.target}</Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
