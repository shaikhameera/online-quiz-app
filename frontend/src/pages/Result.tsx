import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/common/Navbar/Navbar";

import type { QuizResult } from "../types/result";

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state as QuizResult | undefined;

  useEffect(() => {
    if (!result) {
      navigate("/home", { replace: true });
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const wrongAnswers = result.total_questions - result.score;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl bg-white p-10 shadow-lg">
            <div className="text-center">
              <div className="mb-4 text-6xl">🎉</div>

              <h1 className="text-4xl font-bold text-gray-900">
                Quiz Completed
              </h1>

              <p className="mt-3 text-lg text-gray-500">
                Great job! Here are your quiz results.
              </p>
            </div>

            {/* Score */}
            <div className="mt-10 rounded-xl bg-blue-50 p-8 text-center">
              <p className="text-lg text-gray-600">
                Your Score
              </p>

              <h2 className="mt-2 text-6xl font-bold text-blue-600">
                {result.score} / {result.total_questions}
              </h2>

              <p className="mt-4 text-2xl font-semibold text-green-600">
                {result.percentage}%
              </p>
            </div>

            {/* Statistics */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Questions
                </h3>

                <p className="mt-3 text-4xl font-bold text-blue-600">
                  {result.total_questions}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700">
                  Correct
                </h3>

                <p className="mt-3 text-4xl font-bold text-green-600">
                  {result.score}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700">
                  Wrong
                </h3>

                <p className="mt-3 text-4xl font-bold text-red-600">
                  {wrongAnswers}
                </p>
              </div>
            </div>

            {/* Performance */}
            <div className="mt-10 rounded-xl bg-gray-100 p-6 text-center">
              <h3 className="text-xl font-semibold">
                Performance
              </h3>

              <p
                className={`mt-3 text-2xl font-bold ${
                  result.percentage >= 70
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {result.percentage >= 70
                  ? "🎉 Congratulations! You Passed!"
                  : "Keep Practicing! You'll Do Better Next Time."}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate("/home")}
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => navigate("/quiz")}
                className="rounded-lg border border-blue-600 px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Result;
