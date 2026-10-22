"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

const initial = [
  { id: "n1", title: "Assignment graded", body: "Your 'Data cleaning report' was graded: 86/100.", read: false },
  { id: "n2", title: "New assignment", body: "'Build a form' was added to Modern Web Development with Next.js.", read: false },
  { id: "n3", title: "Course completed", body: "You completed Data Analysis with Python. Your certificate is ready.", read: true },
];

export default function NotificationsPage() {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread} unread`}
        action={
          <Button variant="outline" size="sm" disabled={unread === 0} onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}>
            Mark all as read
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="You are all caught up" />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Card className={cn("flex items-start justify-between gap-3 py-3", !n.read && "border-primary")}>
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>
                    Mark read
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
