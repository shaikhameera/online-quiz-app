import api from "./api";
import type { Question, SubmitQuizRequest } from "../types/quiz";
import type { QuizResult } from "../types/result";

export const getQuizQuestions = async (): Promise<Question[]> => {
  const response = await api.get("/quiz/questions");

  return response.data;
};

export const submitQuiz = async (
  payload: SubmitQuizRequest
): Promise<QuizResult> => {
  const response = await api.post("/quiz/submit", payload);

  return response.data;
};
