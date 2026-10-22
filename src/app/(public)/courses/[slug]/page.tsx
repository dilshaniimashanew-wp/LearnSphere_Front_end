import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, PlayCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import { Card } from "@/components/ui/card";
import { EnrollButton } from "@/features/courses/enroll-button";
import { courses, getCourse } from "@/lib/mock-data";
import { formatMinutes } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return { title: course?.title ?? "Course not found", description: course?.summary };
}

export default async function CourseDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <header>
          <div className="flex gap-2">
            <Badge tone="info">{course.category}</Badge>
            <Badge>{course.level}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold">{course.title}</h1>
          <p className="mt-2 text-muted-foreground">{course.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">Instructor: {course.instructor}</p>
        </header>

        <section aria-labelledby="objectives">
          <h2 id="objectives" className="text-xl font-semibold">
            What you will learn
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {course.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="curriculum">
          <h2 id="curriculum" className="text-xl font-semibold">
            Curriculum
          </h2>
          <div className="mt-3 space-y-3">
            {course.modules.map((m, i) => (
              <Card key={m.id} className="p-0">
                <h3 className="border-b border-border px-5 py-3 font-medium">
                  Module {i + 1}: {m.title}
                </h3>
                <ul className="divide-y divide-border">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                        {l.title}
                      </span>
                      <span className="text-muted-foreground">{l.minutes}m</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {course.prerequisites.length > 0 && (
          <section aria-labelledby="prereq">
            <h2 id="prereq" className="text-xl font-semibold">
              Prerequisites
            </h2>
            <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground">
              {course.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside>
        <Card className="sticky top-24 space-y-4">
          <EnrollButton courseId={course.id} />
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden /> Duration
              </dt>
              <dd>{formatMinutes(course.durationMinutes)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Lessons</dt>
              <dd>{course.lessonCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden /> Students
              </dt>
              <dd>{course.students.toLocaleString()}</dd>
            </div>
          </dl>
        </Card>
      </aside>
    </div>
  );
}
