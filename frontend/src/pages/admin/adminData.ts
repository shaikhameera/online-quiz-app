import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import api from "../../services/api";
import type { Question } from "../../types/question";
import type { User } from "../../types/user";

export interface AdminQuestion extends Question {
  subject?: string | null;
  correct_answer: string;
}

export interface AdminUser extends User {
  id: string;
}

export interface AdminStats {
  total_users: number;
  total_questions: number;
  total_results: number;
}

export interface AdminResult {
  quiz_name?: string;
  _id: string;
  user_name: string;
  user_email: string;
  score: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
  answers: {
    question_id: string;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
}

export function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) return "Your session has expired. Please log in again.";
    if (error.response?.status === 403) return "You do not have permission to access this data.";
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return "Unable to complete the request. Please try again.";
}

export function useAdminData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get<T>(`/admin/${path}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setData(data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, revision]);

  function reload() {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }

  return { data, setData, loading, error, reload };
}

export function formatDate(value: string) {
  // The backend stores UTC dates without a timezone suffix.
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}
