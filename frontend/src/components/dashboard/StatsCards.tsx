import { Card } from "@heroui/react";
import type { DashboardStats } from "./types";
import labels from "../../config/labels.json";

interface Props {
  stats: DashboardStats;
}

const StatsCards = ({ stats }: Props) => {
  const cards = [
    {
      title: labels.app.dashboard.highestScore,
      value:
        stats.highestScore !== null
          ? labels.app.formats.percentage.replace("{value}", String(stats.highestScore))
          : labels.app.formats.notAvailable,
    },
    {
      title: labels.app.dashboard.lastScore,
      value:
        stats.lastScore !== null
          ? labels.app.formats.percentage.replace("{value}", String(stats.lastScore))
          : labels.app.formats.notAvailable,
    },
    {
      title: labels.app.dashboard.totalAttempts,
      value: stats.totalAttempts,
    },
    {
      title: labels.app.dashboard.averageScore,
      value:
        stats.averageScore !== null
          ? labels.app.formats.percentage.replace("{value}", String(stats.averageScore))
          : labels.app.formats.notAvailable,
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">
        {labels.app.dashboard.statisticsTitle}
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
