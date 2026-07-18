import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">

          {/* Heading */}
          <h1 className="text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Learn.
            <span className="text-blue-600"> Practice.</span>
            <br />
            Improve.
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Test your knowledge with interactive quizzes, receive instant
            results, and monitor your learning progress through a simple and
            modern quiz platform.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid w-full max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">📝</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              Interactive Quizzes
            </h3>

            <p className="text-slate-600">
              Practice with multiple quizzes designed to strengthen your
              understanding of different topics.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">📊</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              Instant Results
            </h3>

            <p className="text-slate-600">
              Get your score immediately after submitting a quiz and understand
              how well you've performed.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">📚</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              Track Progress
            </h3>

            <p className="text-slate-600">
              View your quiz history and monitor your learning journey over
              time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-center text-sm text-slate-500 md:flex-row">
          <p>© 2026 Online Quiz Assessment. All rights reserved.</p>

          <p>Built with React • FastAPI • MongoDB</p>
        </div>
      </footer>
    </div>
  );
}
