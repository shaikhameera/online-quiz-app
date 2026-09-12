import { Card } from "@heroui/react";
import type { QuizAttempt } from "./types";
import labels from "../../config/labels.json";

interface Props {
  attempts: QuizAttempt[];
  title?: string;
}

const RecentAttempts = ({ attempts, title = labels.app.dashboard.recentAttempts }: Props) => {
  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">
        {title}
      </h2>

      <Card>
        <Card.Content className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">{labels.app.dashboard.table.quiz}</th>
                <th className="p-4">{labels.app.dashboard.table.score}</th>
                <th className="p-4">{labels.app.dashboard.table.percentage}</th>
                <th className="p-4">{labels.app.dashboard.table.date}</th>
              </tr>
            </thead>

            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500"
                  >
                    {labels.app.dashboard.noAttempts}
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b last:border-none"
                  >
                    <td className="p-4">
                      {attempt.quizName}
                    </td>

                    <td className="p-4">
                      {labels.app.formats.compactScore.replace("{score}", String(attempt.score)).replace("{total}", String(attempt.totalMarks))}
                    </td>

                    <td className="p-4">{labels.app.formats.percentage.replace("{value}", String(attempt.percentage))}</td>
                    <td className="p-4">
                      {new Date(
                        attempt.attemptedAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card.Content>
      </Card>
    </section>
  );
};

export default RecentAttempts;
