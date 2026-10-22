import type { Course, Enrollment } from "@/types";

// Temporary sample data so every screen renders before the Express API exists.
// Replace each usage with a call to `api()` as the backend endpoints are built.
export const categories = ["Web Development", "Data Science", "Design", "Business", "Mobile"];

export const courses: Course[] = [
  {
    id: "c1",
    slug: "modern-web-development",
    title: "Modern Web Development with Next.js",
    summary: "Build production-ready apps with React, TypeScript and Next.js.",
    description:
      "A hands-on course covering routing, data fetching, forms, authentication and deployment of full-stack web applications.",
    category: "Web Development",
    level: "intermediate",
    instructor: "Amara Perera",
    status: "published",
    durationMinutes: 540,
    lessonCount: 24,
    students: 1280,
    objectives: ["Build pages with the App Router", "Validate forms with Zod", "Deploy to production"],
    prerequisites: ["Basic JavaScript", "HTML & CSS"],
    modules: [
      {
        id: "m1",
        title: "Getting started",
        lessons: [
          { id: "l1", title: "Project setup", minutes: 12 },
          { id: "l2", title: "Routing basics", minutes: 18 },
        ],
      },
      {
        id: "m2",
        title: "Data & forms",
        lessons: [
          { id: "l3", title: "Fetching data", minutes: 22 },
          { id: "l4", title: "Forms with React Hook Form", minutes: 25 },
        ],
      },
    ],
  },
  {
    id: "c2",
    slug: "node-mongodb-apis",
    title: "REST APIs with Node.js and MongoDB",
    summary: "Design secure, tested REST APIs using Express and Mongoose.",
    description: "Learn schema design, authentication, authorization, validation and testing for real-world APIs.",
    category: "Web Development",
    level: "intermediate",
    instructor: "Kasun Silva",
    status: "published",
    durationMinutes: 480,
    lessonCount: 20,
    students: 940,
    objectives: ["Model data in MongoDB", "Secure endpoints", "Write API tests"],
    prerequisites: ["JavaScript fundamentals"],
    modules: [
      {
        id: "m1",
        title: "Express fundamentals",
        lessons: [
          { id: "l1", title: "Routing & middleware", minutes: 20 },
          { id: "l2", title: "Error handling", minutes: 15 },
        ],
      },
    ],
  },
  {
    id: "c3",
    slug: "data-analysis-python",
    title: "Data Analysis with Python",
    summary: "Clean, explore and visualise data using pandas.",
    description: "From raw CSV files to clear charts and insights, step by step.",
    category: "Data Science",
    level: "beginner",
    instructor: "Nimali Fernando",
    status: "published",
    durationMinutes: 360,
    lessonCount: 16,
    students: 2100,
    objectives: ["Use pandas", "Visualise data", "Tell a story with data"],
    prerequisites: [],
    modules: [{ id: "m1", title: "Foundations", lessons: [{ id: "l1", title: "Intro to pandas", minutes: 20 }] }],
  },
  {
    id: "c4",
    slug: "ui-ux-fundamentals",
    title: "UI/UX Design Fundamentals",
    summary: "Principles of usable, accessible interface design.",
    description: "Research, wireframing, prototyping and usability testing.",
    category: "Design",
    level: "beginner",
    instructor: "Dilan Jayasuriya",
    status: "published",
    durationMinutes: 300,
    lessonCount: 14,
    students: 760,
    objectives: ["Create wireframes", "Apply accessibility basics"],
    prerequisites: [],
    modules: [{ id: "m1", title: "Design thinking", lessons: [{ id: "l1", title: "Users & needs", minutes: 15 }] }],
  },
];

export const enrollments: Enrollment[] = [
  { courseId: "c1", progress: 62, status: "active", nextLesson: "Fetching data" },
  { courseId: "c3", progress: 100, status: "completed", nextLesson: "" },
];

export const upcomingWork = [
  { id: "a1", title: "Assignment: Build a form", course: "Modern Web Development with Next.js", due: "2026-10-30" },
  { id: "q1", title: "Quiz: Routing basics", course: "Modern Web Development with Next.js", due: "2026-11-02" },
];

export const pendingCourses = [
  { id: "p1", title: "Intro to Mobile Apps", instructor: "Ruwan Bandara", submitted: "2026-10-18" },
  { id: "p2", title: "Business Analytics 101", instructor: "Sajini Weerasinghe", submitted: "2026-10-20" },
];

export const adminUsers = [
  { id: "u1", name: "Amara Perera", email: "amara@example.com", role: "instructor", status: "active" },
  { id: "u2", name: "Chamod Ekanayake", email: "chamod@example.com", role: "student", status: "active" },
  { id: "u3", name: "Tharushi Gunawardena", email: "tharushi@example.com", role: "student", status: "suspended" },
];

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export function getCourseById(id: string) {
  return courses.find((c) => c.id === id);
}
