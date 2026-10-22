import { QuizResult } from "@/features/learning/quiz-result";

export default async function QuizResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <QuizResult attemptId={attemptId} />;
}
