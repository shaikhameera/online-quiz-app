import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import QuizHistory from "../components/dashboard/QuizHistory";
import { userNavigation } from "../utils/navigation";
import labels from "../config/labels.json";

export default function History() {
  return <>
    <Navbar links={userNavigation} />
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900">{labels.app.history.title}</h1>
        <p className="mt-2 text-slate-600">{labels.app.history.description}</p>
        <Link to="/quiz" className="mt-5 inline-block font-medium text-blue-600 hover:underline">{labels.app.history.takeQuiz}</Link>
        <QuizHistory />
      </div>
    </main>
  </>;
}
