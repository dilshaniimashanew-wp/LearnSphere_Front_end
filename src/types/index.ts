export type Role = "student" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
  avatarUrl?: string;
}

export type CourseStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: Level;
  instructor: string;
  status: CourseStatus;
  durationMinutes: number;
  lessonCount: number;
  students: number;
  objectives: string[];
  prerequisites: string[];
  modules: { id: string; title: string; lessons: { id: string; title: string; minutes: number }[] }[];
}

export interface Enrollment {
  courseId: string;
  progress: number;
  status: "active" | "completed";
  nextLesson: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
