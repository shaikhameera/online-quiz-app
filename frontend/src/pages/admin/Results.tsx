import { useState } from "react";
import { Card } from "@heroui/react";
import labels from "../../config/labels.json";
import AdminPage, { DataState } from "./AdminPage";
import { formatDate, useAdminData } from "./adminData";
import type { AdminResult } from "./adminData";

export default function Results() {
  const request = useAdminData<AdminResult[]>("results");
  const [search, setSearch] = useState("");
  const results = (request.data ?? []).filter((result) =>
    `${result.user_name} ${result.user_email}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  return <AdminPage title={labels.app.admin.results.title} description={labels.app.admin.results.description}>
    <div>
      <label htmlFor="result-search" className="mb-2 block font-medium">{labels.app.admin.results.search}</label>
      <input id="result-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.app.admin.results.searchPlaceholder} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:max-w-md" />
    </div>
    <DataState {...request}>
      <Card><Card.Content className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="p-4 text-left text-slate-600">{labels.app.admin.results.count.replace("{count}", String(results.length))}</caption>
          <thead><tr className="border-b">{Object.values(labels.app.admin.results.columns).map((label) => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead>
          <tbody>{results.map((result) => <tr key={result._id} className="border-b align-top last:border-none">
            <td className="p-4"><p className="font-medium">{result.user_name}</p><p className="text-sm text-slate-500">{result.user_email}</p></td>
            <td className="p-4">{result.quiz_name || labels.app.quiz.generalName}</td>
            <td className="whitespace-nowrap p-4">{labels.app.formats.score.replace("{score}", String(result.score)).replace("{total}", String(result.total_questions))}</td>
            <td className="p-4">{labels.app.formats.percentage.replace("{value}", String(result.percentage))}</td>
            <td className="whitespace-nowrap p-4">{formatDate(result.submitted_at)}</td>
            <td className="p-4"><details><summary className="cursor-pointer whitespace-nowrap text-blue-600">{labels.app.admin.results.viewAnswers}</summary>
              <ol className="mt-3 min-w-64 space-y-3">{result.answers?.map((answer, index) => <li key={`${answer.question_id}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium">{labels.app.admin.results.answerStatus.replace("{number}", String(index + 1)).replace("{status}", answer.is_correct ? labels.app.admin.results.correct : labels.app.admin.results.incorrect)}</p>
                <p>{labels.app.admin.results.selected.replace("{answer}", answer.selected_answer || labels.app.admin.results.noAnswer)}</p><p>{labels.app.admin.results.correctAnswer.replace("{answer}", answer.correct_answer)}</p>
              </li>)}</ol>
              {!result.answers?.length && <p className="mt-3 text-sm text-slate-500">{labels.app.admin.results.noRecordedAnswers}</p>}
            </details></td>
          </tr>)}
          {results.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{request.data?.length ? labels.app.admin.results.noMatches : labels.app.admin.results.empty}</td></tr>}</tbody>
        </table>
      </Card.Content></Card>
    </DataState>
  </AdminPage>;
}
