import { QuizTaker } from "@/features/learning/quiz-taker";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <QuizTaker quizId={quizId} />;
}
