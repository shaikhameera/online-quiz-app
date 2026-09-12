import { Button } from "@heroui/react";
import labels from "../../config/labels.json";
import AdminPage, { DataState, SummaryCards } from "./AdminPage";
import { useAdminData } from "./adminData";
import type { AdminStats } from "./adminData";

export default function Stats() {
  const request = useAdminData<AdminStats>("stats");
  return <AdminPage title={labels.app.admin.stats.title} description={labels.app.admin.stats.description}>
    <Button onPress={request.reload} isDisabled={request.loading}>{labels.app.admin.stats.refresh}</Button>
    <DataState {...request}>
      {request.data && <SummaryCards stats={request.data} />}
    </DataState>
  </AdminPage>;
}
