import Link from "next/link";
import { BookOpen, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { formatMinutes } from "@/lib/utils";
import type { Course } from "@/types";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="flex h-32 items-center justify-center bg-accent text-primary" aria-hidden>
        <BookOpen className="h-10 w-10" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="info">{course.category}</Badge>
          <Badge>{course.level}</Badge>
        </div>
        <h3 className="font-semibold group-hover:text-primary">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.summary}</p>
        <p className="text-xs text-muted-foreground">by {course.instructor}</p>
        <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatMinutes(course.durationMinutes)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {course.students.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
