export interface Question {
  id: string;
  question: string;
  options: string[];
}

export interface SubmitAnswer {
  question_id: string;
  selected_answer: string;
}

export interface SubmitQuizRequest {
  answers: SubmitAnswer[];
}
