import { Button } from "@heroui/react";
import AdminPage, { DataState, SummaryCards } from "./AdminPage";
import { useAdminData } from "./adminData";
import type { AdminStats } from "./adminData";

export default function Stats() {
  const request = useAdminData<AdminStats>("stats");
  return <AdminPage title="Statistics" description="Current totals across the quiz platform. Each submitted quiz counts as one attempt.">
    <Button onPress={request.reload} isDisabled={request.loading}>Refresh statistics</Button>
    <DataState {...request}>
      {request.data && <SummaryCards stats={request.data} />}
    </DataState>
  </AdminPage>;
}
