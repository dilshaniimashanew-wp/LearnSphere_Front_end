"use client";

import { CourseCard } from "@/components/layout/course-card";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import type { Course, Paginated } from "@/types";

export function PopularCourses() {
  const { data, error, loading } = useApi<Paginated<Course>>("/courses?pageSize=4");
  return (
    <Query loading={loading} error={error}>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.items.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </Query>
  );
}
