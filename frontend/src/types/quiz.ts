export interface Question {
  id: string;
  question: string;
  options: string[];
  subject?: string;
}

export interface SubmitAnswer {
  question_id: string;
  selected_answer: string;
}

export interface SubmitQuizRequest {
  answers: SubmitAnswer[];
  attempt_id?: string;
}

export interface QuizBatch {
  attempt_id: string;
  quiz_name: string;
  duration_seconds: number | null;
  expires_at: string;
  questions: Question[];
}

export interface QuizConfig {
  quiz_name: string;
  duration_seconds: number | null;
  subjects: { name: string }[];
  available_subjects: string[];
}
