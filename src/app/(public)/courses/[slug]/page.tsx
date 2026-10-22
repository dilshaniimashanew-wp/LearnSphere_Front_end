import type { Metadata } from "next";
import { CourseDetail } from "@/features/courses/course-detail";

export const metadata: Metadata = { title: "Course" };

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CourseDetail slug={slug} />;
}
