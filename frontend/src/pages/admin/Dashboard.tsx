import { Card } from "@heroui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AdminPage, { DataState, SummaryCards } from "./AdminPage";
import { useAdminData } from "./adminData";
import type { AdminStats } from "./adminData";

export default function Dashboard() {
  const { user } = useAuth();
  const request = useAdminData<AdminStats>("stats");
  return <AdminPage title="Admin Dashboard" description={`Welcome back, ${user?.name || "Admin"}. Manage your quiz platform here.`}>
    <DataState {...request}>
      {request.data && <SummaryCards stats={request.data} />}
    </DataState>
    <section>
      <h2 className="mb-5 text-2xl font-bold">Quick Actions</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          ["Questions", "Add, edit, and delete quiz questions.", "questions"],
          ["Users", "Create user accounts and view their roles.", "users"],
          ["Results", "Review quiz attempts and submitted answers.", "results"],
          ["Statistics", "View platform totals.", "stats"],
        ].map(([title, description, path]) => <Link key={path} to={`/admin/${path}`} className="rounded-xl transition hover:-translate-y-1 hover:shadow-lg">
          <Card className="h-full">
            <Card.Header><Card.Title>{title}</Card.Title><Card.Description>{description}</Card.Description></Card.Header>
          </Card>
        </Link>)}
      </div>
    </section>
  </AdminPage>;
}
