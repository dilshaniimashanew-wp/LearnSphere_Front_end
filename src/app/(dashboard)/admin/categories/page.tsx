"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, PageHeader } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form";
import { Query } from "@/components/ui/query";
import { errorMessage, send, useApi } from "@/lib/use-api";

interface Cat {
  id: string;
  name: string;
  courses: number;
}

export default function CategoriesPage() {
  const { data, error, loading, reload } = useApi<Cat[]>("/admin/categories");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await send("POST", "/admin/categories", { name: name.trim() });
      setName("");
      reload();
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  async function remove(c: Cat) {
    setMessage(null);
    try {
      await send("DELETE", `/admin/categories/${c.id}`);
      reload();
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Categories" description="Used to organise the course catalog." />
      <form onSubmit={add} className="mb-6 flex max-w-md gap-2">
        <Input
          aria-label="New category name"
          placeholder="New category"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>
      {message && (
        <div className="mb-4">
          <Alert tone="danger">{message}</Alert>
        </div>
      )}
      <Query loading={loading} error={error}>
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.map((c) => (
            <Card key={c.id} className="flex items-center justify-between py-3">
              <span>
                {c.name} <span className="text-sm text-muted-foreground">({c.courses} courses)</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={c.courses > 0}
                title={c.courses > 0 ? "Categories with courses cannot be deleted" : undefined}
                onClick={() => void remove(c)}
              >
                Remove
              </Button>
            </Card>
          ))}
        </div>
      </Query>
    </>
  );
}
