import { Card } from "@heroui/react";
import type { QuizAttempt } from "./types";

interface Props {
  attempts: QuizAttempt[];
}

const RecentAttempts = ({ attempts }: Props) => {
  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">
        Recent Attempts
      </h2>

      <Card>
        <Card.Content className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Quiz</th>
                <th className="p-4">Score</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-gray-500"
                  >
                    No quiz attempts yet.
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
                      {attempt.score}/{attempt.totalMarks}
                    </td>

                    <td className="p-4">
                      {new Date(
                        attempt.attemptedAt
                      ).toLocaleDateString()}
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
