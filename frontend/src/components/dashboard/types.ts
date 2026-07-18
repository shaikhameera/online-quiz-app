export interface DashboardStats {
  highestScore: number | null;
  lastScore: number | null;
  totalAttempts: number;
  averageScore: number | null;
}

export interface QuizAttempt {
  id: string;
  quizName: string;
  score: number;
  totalMarks: number;
  attemptedAt: string;
}
