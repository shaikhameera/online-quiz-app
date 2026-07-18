import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/common/Navbar/Navbar";

import type { Question } from "../types/quiz";

import { getQuizQuestions, submitQuiz } from "../services/quiz";

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

  // Load Questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getQuizQuestions();
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    if (submitting) return;

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
      console.error(error);
    }
  }, [answers, questions, navigate]);

  // Auto Submit
  useEffect(() => {
    if (loading || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Submit after the state update completes
          setTimeout(() => {
            handleSubmit();
          }, 0);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, handleSubmit]);

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
          <h2 className="text-2xl font-semibold">No Questions Found</h2>
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
            <h1 className="text-3xl font-bold">Programming Quiz</h1>

            <div className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-700">
              Time Left: {formattedTime}
            </div>
          </div>

          <p className="mb-8 text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>

          <div className="rounded-xl bg-white p-8 shadow">
            <h2 className="mb-6 text-2xl font-semibold">{question.question}</h2>

            <div className="space-y-4">
              {question.options.map((option) => (
                <button
                  key={option}
                  disabled={submitting}
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
                disabled={submitting || !answers[question.id]}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>

          {/* Temporary Debug */}
          <pre className="mt-8 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-white">
            {JSON.stringify(answers, null, 2)}
          </pre>
        </div>
      </main>
    </>
  );
};

export default Quiz;
