import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { isAxiosError } from "axios";
import Navbar from "../components/common/Navbar/Navbar";

import type { Question } from "../types/quiz";

import { startQuiz, submitQuiz } from "../services/quiz";

const QUIZ_DURATION = 60; // seconds

const Quiz = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const hasSubmitted = useRef(false);
  const autoSubmitted = useRef(false);
  const deadline = useRef(0);
  const [attemptId, setAttemptId] = useState("");
  const [quizName, setQuizName] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    startQuiz(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      const configured = data.duration_seconds;
      const duration = typeof configured === "number" && Number.isInteger(configured) && configured > 0 && configured <= 86400 ? configured : QUIZ_DURATION;
      setQuestions(data.questions);
      setAttemptId(data.attempt_id);
      setQuizName(data.quiz_name);
      deadline.current = Date.now() + duration * 1000;
      setTimeLeft(duration);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setLoadError(isAxiosError(error) && typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Unable to load the quiz. Please try again.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    if (submitting || timeLeft === 0) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted.current) return;

    hasSubmitted.current = true;
    setSubmitting(true);

    try {
      const payload = {
        attempt_id: attemptId,
        answers: questions.map((question) => ({
          question_id: question.id,
          selected_answer: answers[question.id] ?? "",
        })),
      };

      const result = await submitQuiz(payload);

      navigate("/result", {
        state: result,
        replace: true,
      });
      
    } catch (error) {
      hasSubmitted.current = false;
      setSubmitting(false);
      setError(isAxiosError(error) && typeof error.response?.data?.detail === "string" ? error.response.data.detail : "Submission failed. Please retry; your answers are still here.");
    }
  }, [answers, questions, navigate, attemptId]);

  useEffect(() => {
    if (loading || !questions.length) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [loading, questions.length]);

  useEffect(() => {
    if (!loading && questions.length && timeLeft === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void handleSubmit();
    }
  }, [loading, questions.length, timeLeft, handleSubmit]);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <h2 className="text-2xl font-semibold">Loading Questions...</h2>
        </main>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div><h2 className="text-2xl font-semibold">{loadError || "No Questions Found"}</h2><button onClick={() => window.location.reload()} className="mt-4 text-blue-600">Try again</button></div>
        </main>
      </>
    );
  }

  const question = questions[currentQuestionIndex];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{quizName}</h1>

            <div className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-700">
              Time Left: {formattedTime}
            </div>
          </div>

          {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error} <button disabled={submitting} onClick={handleSubmit} className="underline">Retry submission</button></div>}
          <div className="mb-4 flex flex-wrap gap-3">{[...new Set(questions.map((item) => item.subject || "Unassigned"))].map((subject) => <button key={subject} disabled={submitting} onClick={() => setCurrentQuestionIndex(questions.findIndex((item) => (item.subject || "Unassigned") === subject))} className={`rounded-lg px-4 py-2 ${question.subject === subject ? "bg-blue-600 text-white" : "bg-white"}`}>{subject}</button>)}</div>
          <p className="mb-8 text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>

          <div className="rounded-xl bg-white p-8 shadow">
            <h2 className="mb-6 text-2xl font-semibold">{question.question}</h2>

            <div className="space-y-4">
              {question.options.map((option) => (
                <button
                  key={option}
                  disabled={submitting || timeLeft === 0}
                  onClick={() => handleAnswerSelect(question.id, option)}
                  className={`w-full rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    answers[question.id] === option
                      ? "border-blue-600 bg-blue-100"
                      : "hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={submitting || currentQuestionIndex === 0}
              className="rounded-lg border px-6 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Quiz;
