import type { ReactNode } from "react";
import { Button, Card } from "@heroui/react";
import Navbar from "../../components/common/Navbar";
import labels from "../../config/labels.json";
import { adminNavigation } from "../../utils/navigation";
import type { AdminStats } from "./adminData";

export default function AdminPage({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return <>
    <Navbar links={adminNavigation} />
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
      </header>
      {children}
    </main>
  </>;
}

export function DataState({ loading, error, reload, children }: {
  loading: boolean;
  error: string;
  reload: () => void;
  children: ReactNode;
}) {
  if (loading) return <p role="status" className="py-8 text-slate-600">{labels.app.messages.loadingData}</p>;
  if (error) return <div role="alert" className="space-y-4 rounded-xl bg-red-50 p-6 text-red-700">
    <p>{error}</p>
    <Button onPress={reload}>{labels.app.buttons.tryAgain}</Button>
  </div>;
  return <>{children}</>;
}

export function SummaryCards({ stats }: { stats: AdminStats }) {
  return <div className="grid gap-6 sm:grid-cols-3">
    {[
      [labels.app.admin.summary.totalUsers, stats.total_users],
      [labels.app.admin.summary.totalQuestions, stats.total_questions],
      [labels.app.admin.summary.quizAttempts, stats.total_results],
    ].map(([label, value]) => <Card key={label}>
      <Card.Content className="p-6">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
      </Card.Content>
    </Card>)}
  </div>;
}
