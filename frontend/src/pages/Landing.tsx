import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar/Navbar";
import labels from "../config/labels.json";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">

          {/* Heading */}
          <h1 className="text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            {labels.app.landing.headlineLearn}
            <span className="text-blue-600">{labels.app.landing.headlinePractice}</span>
            <br />
            {labels.app.landing.headlineImprove}
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-slate-600">
            {labels.app.landing.description}
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              {labels.app.landing.getStarted}
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid w-full max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">{labels.app.landing.features.interactiveIcon}</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              {labels.app.landing.features.interactiveTitle}
            </h3>

            <p className="text-slate-600">
              {labels.app.landing.features.interactiveDescription}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">{labels.app.landing.features.resultsIcon}</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              {labels.app.landing.features.resultsTitle}
            </h3>

            <p className="text-slate-600">
              {labels.app.landing.features.resultsDescription}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 text-5xl">{labels.app.landing.features.progressIcon}</div>

            <h3 className="mb-3 text-xl font-bold text-slate-800">
              {labels.app.landing.features.progressTitle}
            </h3>

            <p className="text-slate-600">
              {labels.app.landing.features.progressDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-center text-sm text-slate-500 md:flex-row">
          <p>{labels.app.landing.footer.copyright}</p>

          <p>{labels.app.landing.footer.technology}</p>

          <p>{labels.app.landing.footer.author}</p>
        </div>
      </footer>
    </div>
  );
}
