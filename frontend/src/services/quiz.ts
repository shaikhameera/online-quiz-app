import api from "./api";
import type { Question, SubmitQuizRequest, QuizBatch } from "../types/quiz";
import type { QuizResult, QuizHistoryEntry } from "../types/result";

export const getQuizHistory = async (signal?: AbortSignal): Promise<QuizHistoryEntry[]> => {
  const response = await api.get<QuizHistoryEntry[]>("/quiz/history", { signal });
  return response.data;
};

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

export const startQuiz = async (signal?: AbortSignal): Promise<QuizBatch> => {
  const response = await api.post<QuizBatch>("/quiz/start", {}, { signal });
  return response.data;
};
