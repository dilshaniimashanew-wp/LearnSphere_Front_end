import { Button } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { Badge, PageHeader } from "@/components/ui/feedback";
import { adminUsers } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users" description="Manage accounts and status." />
      <DataTable caption="All users" columns={["Name", "Email", "Role", "Status", "Actions"]}>
        {adminUsers.map((u) => (
          <tr key={u.id}>
            <Td className="font-medium">{u.name}</Td>
            <Td>{u.email}</Td>
            <Td className="capitalize">{u.role}</Td>
            <Td>
              <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
            </Td>
            <Td>
              <Button variant="outline" size="sm">
                {u.status === "active" ? "Suspend" : "Reactivate"}
              </Button>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
