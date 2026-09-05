export interface QuizHistoryEntry {
  result_id: string;
  quiz_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
}

export interface QuizResult {
  result_id: string;
  quiz_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  message: string;
}
