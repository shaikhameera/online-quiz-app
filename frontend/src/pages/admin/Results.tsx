import { useState } from "react";
import { Card } from "@heroui/react";
import AdminPage, { DataState } from "./AdminPage";
import { formatDate, useAdminData } from "./adminData";
import type { AdminResult } from "./adminData";

export default function Results() {
  const request = useAdminData<AdminResult[]>("results");
  const [search, setSearch] = useState("");
  const results = (request.data ?? []).filter((result) =>
    `${result.user_name} ${result.user_email}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  return <AdminPage title="Results" description="Review submitted quizzes, newest first. Expand an attempt to inspect its answers.">
    <div>
      <label htmlFor="result-search" className="mb-2 block font-medium">Search results</label>
      <input id="result-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:max-w-md" />
    </div>
    <DataState {...request}>
      <Card><Card.Content className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="p-4 text-left text-slate-600">{results.length} quiz attempts</caption>
          <thead><tr className="border-b">{["User", "Quiz", "Score", "Percentage", "Submitted", "Answers"].map((label) => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead>
          <tbody>{results.map((result) => <tr key={result._id} className="border-b align-top last:border-none">
            <td className="p-4"><p className="font-medium">{result.user_name}</p><p className="text-sm text-slate-500">{result.user_email}</p></td>
            <td className="p-4">{result.quiz_name || "General Quiz"}</td>
            <td className="whitespace-nowrap p-4">{result.score} / {result.total_questions}</td>
            <td className="p-4">{result.percentage}%</td>
            <td className="whitespace-nowrap p-4">{formatDate(result.submitted_at)}</td>
            <td className="p-4"><details><summary className="cursor-pointer whitespace-nowrap text-blue-600">View answers</summary>
              <ol className="mt-3 min-w-64 space-y-3">{result.answers?.map((answer, index) => <li key={`${answer.question_id}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium">Answer {index + 1}: {answer.is_correct ? "Correct" : "Incorrect"}</p>
                <p>Selected: {answer.selected_answer || "No answer"}</p><p>Correct answer: {answer.correct_answer}</p>
              </li>)}</ol>
              {!result.answers?.length && <p className="mt-3 text-sm text-slate-500">No recorded answers.</p>}
            </details></td>
          </tr>)}
          {results.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{request.data?.length ? "No results match your search." : "No quiz attempts yet."}</td></tr>}</tbody>
        </table>
      </Card.Content></Card>
    </DataState>
  </AdminPage>;
}
