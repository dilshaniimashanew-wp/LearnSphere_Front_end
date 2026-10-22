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

export interface Lesson {
  id: string;
  title: string;
  type: "text" | "video";
  minutes: number;
  isRequired: boolean;
  order: number;
  content?: string;
  videoUrl?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categoryId: string;
  category: string;
  level: Level;
  instructor: string;
  instructorId: string;
  status: CourseStatus;
  moderationNote?: string;
  durationMinutes: number;
  lessonCount: number;
  students: number;
  rating: number;
  reviewCount: number;
  objectives: string[];
  prerequisites: string[];
  modules?: CourseModule[];
  enrolled?: boolean;
  completedLessonIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueAt: string;
  maxPoints: number;
  allowResubmission: boolean;
  course?: string;
  submission: Submission | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  textResponse?: string;
  fileUrl?: string;
  submittedAt: string;
  isLate: boolean;
  status: "submitted" | "graded";
  version: number;
  grade: { pointsAwarded: number; feedback?: string; gradedAt: string } | null;
}

export interface QuizSummary {
  id: string;
  title: string;
  instructions?: string;
  timeLimitSeconds: number;
  passMark: number;
  maxAttempts: number;
  questionCount: number;
  attemptsUsed?: number;
  passed?: boolean;
  bestScore?: number | null;
  latestAttemptId?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}
