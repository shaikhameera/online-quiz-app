import { Card } from "@heroui/react";
import { HiPlay, HiClock } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          onClick={() => navigate("/quiz")}
        >
          <Card.Header className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <HiPlay className="text-3xl text-blue-600" />
            </div>

            <div>
              <Card.Title>Start Quiz</Card.Title>

              <Card.Description>
                Take a new quiz and test your knowledge.
              </Card.Description>
            </div>
          </Card.Header>
        </Card>

        <Card
          className="cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          onClick={() => navigate("/history")}
        >
          <Card.Header className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <HiClock className="text-3xl text-green-600" />
            </div>

            <div>
              <Card.Title>Quiz History</Card.Title>

              <Card.Description>
                View your previous quiz attempts.
              </Card.Description>
            </div>
          </Card.Header>
        </Card>
      </div>
    </section>
  );
};

export default QuickActions;
