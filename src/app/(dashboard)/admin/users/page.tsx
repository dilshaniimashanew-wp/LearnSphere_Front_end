"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Td } from "@/components/ui/data-table";
import { Alert, Badge, PageHeader } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";
import type { Paginated, User } from "@/types";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const params = new URLSearchParams({ page: String(page), pageSize: "10" });
  if (q.trim()) params.set("q", q.trim());
  if (role) params.set("role", role);
  const { data, error: loadError, loading, reload } = useApi<Paginated<User>>(`/admin/users?${params}`);
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 10));

  async function toggle(u: User) {
    setError(null);
    try {
      await send("PATCH", `/admin/users/${u.id}/status`, { status: u.status === "active" ? "suspended" : "active" });
      reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Manage accounts and status." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <Input
          aria-label="Search users"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <Select
          aria-label="Role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </Select>
      </div>
      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
      <Query loading={loading && !data} error={loadError}>
        <DataTable caption="All users" columns={["Name", "Email", "Role", "Status", "Actions"]}>
          {data?.items.map((u) => (
            <tr key={u.id}>
              <Td className="font-medium">{u.name}</Td>
              <Td>{u.email}</Td>
              <Td className="capitalize">{u.role}</Td>
              <Td>
                <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
              </Td>
              <Td>
                <Button variant="outline" size="sm" onClick={() => void toggle(u)}>
                  {u.status === "active" ? "Suspend" : "Reactivate"}
                </Button>
              </Td>
            </tr>
          ))}
        </DataTable>
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {pages}
            </span>
            <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </Query>
    </>
  );
}
