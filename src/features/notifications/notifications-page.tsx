"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { send, useApi } from "@/lib/use-api";
import { cn, formatDate } from "@/lib/utils";
import type { Paginated } from "@/types";

interface Notification {
  id: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsPage() {
  const { data, error, loading, reload } = useApi<Paginated<Notification> & { unread: number }>("/notifications");

  async function markRead(id: string) {
    await send("PATCH", `/notifications/${id}/read`).catch(() => undefined);
    reload();
  }
  async function markAll() {
    await send("PATCH", "/notifications/read-all").catch(() => undefined);
    reload();
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${data?.unread ?? 0} unread`}
        action={
          <Button variant="outline" size="sm" disabled={!data?.unread} onClick={() => void markAll()}>
            Mark all as read
          </Button>
        }
      />
      <Query loading={loading} error={error}>
        {data?.items.length === 0 ? (
          <EmptyState title="You are all caught up" />
        ) : (
          <ul className="space-y-2">
            {data?.items.map((n) => (
              <li key={n.id}>
                <Card className={cn("flex items-start justify-between gap-3 py-3", !n.read && "border-primary")}>
                  <div>
                    <p className="font-medium">{n.link ? <Link href={n.link} className="hover:text-primary" onClick={() => !n.read && void markRead(n.id)}>{n.title}</Link> : n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => void markRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Query>
    </>
  );
}
