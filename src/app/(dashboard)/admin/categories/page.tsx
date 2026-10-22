"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form";
import { categories as initial } from "@/lib/mock-data";

export default function CategoriesPage() {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value || items.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    setItems([...items, value]);
    setName("");
  }

  return (
    <>
      <PageHeader title="Categories" description="Used to organise the course catalog." />
      <form onSubmit={add} className="mb-6 flex max-w-md gap-2">
        <Input aria-label="New category name" placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Add</Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <Card key={c} className="flex items-center justify-between py-3">
            <span>{c}</span>
            <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((x) => x !== c))}>
              Remove
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
