import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { useQuizHistory } from "../../hooks/useQuizHistory";
import StatsCards from "./StatsCards";
import RecentAttempts from "./RecentAttempts";
import labels from "../../config/labels.json";

export default function QuizHistory({ recent = false }: { recent?: boolean }) {
  const { history, loading, error, reload } = useQuizHistory();
  if (loading) return <p role="status" className="mt-10 text-slate-600">{labels.app.dashboard.loadingHistory}</p>;
  if (error) return <div role="alert" className="mt-10 space-y-4 rounded-xl bg-red-50 p-6 text-red-700">
    <p>{error}</p><Button onPress={reload}>{labels.app.buttons.tryAgain}</Button>
  </div>;

  const stats = {
    highestScore: history.length ? history.reduce((highest, item) => Math.max(highest, item.percentage), 0) : null,
    lastScore: history[0]?.percentage ?? null,
    totalAttempts: history.length,
    averageScore: history.length ? Number((history.reduce((sum, item) => sum + item.percentage, 0) / history.length).toFixed(2)) : null,
  };
  const attempts = (recent ? history.slice(0, 5) : history).map((item) => ({
    id: item.result_id,
    quizName: item.quiz_name,
    score: item.score,
    totalMarks: item.total_questions,
    percentage: item.percentage,
    attemptedAt: item.submitted_at,
  }));

  return <>
    <StatsCards stats={stats} />
    <RecentAttempts attempts={attempts} title={recent ? labels.app.dashboard.recentAttempts : labels.app.dashboard.allAttempts} />
    {recent && <Link to="/history" className="mt-5 inline-block font-medium text-blue-600 hover:underline">{labels.app.dashboard.viewAllHistory}</Link>}
  </>;
}
