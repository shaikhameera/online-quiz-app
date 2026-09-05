import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { getQuizHistory } from "../services/quiz";
import { useAuth } from "./useAuth";
import type { QuizHistoryEntry } from "../types/result";

export function useQuizHistory() {
  const { user } = useAuth();
  const email = user?.email;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    email: string | undefined;
    revision: number;
    history: QuizHistoryEntry[];
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!email) return;
    const controller = new AbortController();
    getQuizHistory(controller.signal).then((history) => {
      if (!controller.signal.aborted) setState({ email, revision, history, error: "" });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({
        email, revision, history: [],
        error: isAxiosError(error) && error.response?.status === 401
          ? "Your session has expired. Please log in again."
          : "Unable to load your quiz history. Please try again.",
      });
    });
    return () => controller.abort();
  }, [email, revision]);

  const current = state?.email === email && state?.revision === revision ? state : null;
  return {
    history: current?.history ?? [],
    error: current?.error ?? "",
    loading: !!email && !current,
    reload: () => setRevision((value) => value + 1),
  };
}
