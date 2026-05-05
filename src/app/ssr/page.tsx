import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/server-auth";
import { getTaskAnalytics, initTaskTable } from "@/services/task-service";
import { initUsersTable } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export default async function SsrPage() {
  await initUsersTable();
  await initTaskTable();
  const auth = await requireAuth();
  if (!auth) redirect("/auth");

  const analytics = await getTaskAnalytics(auth.userId);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">SSR Example</h2>
      <p>This page fetches live data from PostgreSQL on every request.</p>
      <p>Total tasks in DB: {analytics.totalTasks}</p>
      <p>Done tasks: {analytics.doneTasks}</p>
      <p>Overdue tasks: {analytics.overdueTasks}</p>
    </section>
  );
}
