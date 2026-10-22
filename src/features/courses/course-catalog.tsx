"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/layout/course-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Category, Course, Paginated } from "@/types";

const PAGE_SIZE = 6;

export function CourseCatalog() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(""); // debounced copy of `query`
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (search) params.set("q", search);
  if (category) params.set("category", category);
  if (level) params.set("level", level);

  const categories = useApi<Category[]>("/categories");
  const courses = useApi<Paginated<Course>>(`/courses?${params}`);
  const total = courses.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          aria-label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Level"
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </div>

      <div className="mt-4">
        <Query loading={courses.loading && !courses.data} error={courses.error}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total} course{total === 1 ? "" : "s"} found
          </p>
          {courses.data?.items.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No courses match your filters" description="Try a different keyword or clear the filters." />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.data?.items.map((c) => (
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
        </Query>
      </div>
    </div>
  );
}
