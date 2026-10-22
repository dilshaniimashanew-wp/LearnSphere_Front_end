"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/layout/course-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form";
import { categories, courses } from "@/lib/mock-data";

const PAGE_SIZE = 6;

export function CourseCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        c.status === "published" &&
        (!q || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) &&
        (!category || c.category === category) &&
        (!level || c.level === level),
    );
  }, [query, category, level]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function update<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_160px]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search courses"
            placeholder="Search courses"
            className="pl-9"
            value={query}
            onChange={(e) => update(setQuery)(e.target.value)}
          />
        </div>
        <Select aria-label="Category" value={category} onChange={(e) => update(setCategory)(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select aria-label="Level" value={level} onChange={(e) => update(setLevel)(e.target.value)}>
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} course{filtered.length === 1 ? "" : "s"} found
      </p>

      {visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No courses match your filters" description="Try a different keyword or clear the filters." />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
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
    </div>
  );
}
