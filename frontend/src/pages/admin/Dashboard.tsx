import { Card } from "@heroui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import labels from "../../config/labels.json";
import AdminPage, { DataState, SummaryCards } from "./AdminPage";
import { useAdminData } from "./adminData";
import type { AdminStats } from "./adminData";

export default function Dashboard() {
  const { user } = useAuth();
  const request = useAdminData<AdminStats>("stats");
  return <AdminPage title={labels.app.admin.dashboard.title} description={labels.app.admin.dashboard.description.replace("{name}", user?.name || labels.app.admin.defaultName)}>
    <DataState {...request}>
      {request.data && <SummaryCards stats={request.data} />}
    </DataState>
    <section>
      <h2 className="mb-5 text-2xl font-bold">{labels.app.dashboard.quickActions}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          [labels.app.navbar.questions, labels.app.admin.dashboard.questionsDescription, "questions"],
          [labels.app.navbar.users, labels.app.admin.dashboard.usersDescription, "users"],
          [labels.app.navbar.results, labels.app.admin.dashboard.resultsDescription, "results"],
          [labels.app.admin.dashboard.statistics, labels.app.admin.dashboard.statisticsDescription, "stats"],
        ].map(([title, description, path]) => <Link key={path} to={`/admin/${path}`} className="rounded-xl transition hover:-translate-y-1 hover:shadow-lg">
          <Card className="h-full">
            <Card.Header><Card.Title>{title}</Card.Title><Card.Description>{description}</Card.Description></Card.Header>
          </Card>
        </Link>)}
      </div>
    </section>
  </AdminPage>;
}
