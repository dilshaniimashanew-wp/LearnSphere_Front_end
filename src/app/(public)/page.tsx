import { Award, BookOpen, ClipboardCheck, LineChart, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PopularCourses } from "@/features/courses/popular-courses";

const features = [
  {
    icon: BookOpen,
    title: "Structured courses",
    text: "Modules and lessons with text, video and resources, and automatic progress tracking.",
  },
  {
    icon: ClipboardCheck,
    title: "Quizzes & assignments",
    text: "Server-graded quizzes, file submissions, instructor grading and feedback.",
  },
  { icon: LineChart, title: "Track progress", text: "See completion, upcoming work and grades from one student dashboard." },
  { icon: Award, title: "Certificates", text: "Earn a verifiable certificate when you complete a course." },
  { icon: Users, title: "Built for instructors", text: "Create, publish and analyse your courses with simple tools." },
  { icon: ShieldCheck, title: "Moderated & secure", text: "Admin approval, role-based access and audited actions." },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-accent">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Learn, teach and grow on one learning platform
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            LearnSphere lets instructors publish structured courses and students learn at their own pace, with quizzes, assignments,
            progress tracking and certificates.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/courses" size="lg">
              Browse courses
            </ButtonLink>
            <ButtonLink href="/register" variant="outline" size="lg">
              Create free account
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Everything in one place</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Popular courses</h2>
          <ButtonLink href="/courses" variant="ghost" size="sm">
            View all
          </ButtonLink>
        </div>
        <PopularCourses />
      </section>
    </>
  );
}
