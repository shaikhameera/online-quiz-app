import { Card } from "@heroui/react";
import type { DashboardStats } from "./types";

interface Props {
  stats: DashboardStats;
}

const StatsCards = ({ stats }: Props) => {
  const cards = [
    {
      title: "Highest Score",
      value:
        stats.highestScore !== null
          ? `${stats.highestScore}%`
          : "--",
    },
    {
      title: "Last Score",
      value:
        stats.lastScore !== null
          ? `${stats.lastScore}%`
          : "--",
    },
    {
      title: "Total Attempts",
      value: stats.totalAttempts,
    },
    {
      title: "Average Score",
      value:
        stats.averageScore !== null
          ? `${stats.averageScore}%`
          : "--",
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">
        Your Statistics
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <Card.Content className="p-6">
              <p className="text-sm text-gray-500">
                {card.title}
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                {card.value}
              </h3>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default StatsCards;
