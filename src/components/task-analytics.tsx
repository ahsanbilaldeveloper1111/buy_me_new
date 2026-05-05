"use client";

import type { TaskAnalytics } from "@/models/task";

export function TaskAnalyticsCard({ analytics }: { analytics: TaskAnalytics }) {
  return (
    <section className="rounded border p-4">
      <h3 className="mb-2 text-lg font-semibold">Analytics (Advanced PostgreSQL Query)</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <p>Total: {analytics.totalTasks}</p>
        <p>Done: {analytics.doneTasks}</p>
        <p>Overdue: {analytics.overdueTasks}</p>
      </div>
      <p className="mt-3 text-sm">Top priorities distribution:</p>
      <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
        {JSON.stringify(analytics.topPriorities, null, 2)}
      </pre>
      <p className="mt-3 text-sm">Recently completed:</p>
      <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
        {JSON.stringify(analytics.recentCompletedTitles, null, 2)}
      </pre>
    </section>
  );
}
