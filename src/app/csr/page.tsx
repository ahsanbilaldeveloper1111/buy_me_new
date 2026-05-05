"use client";

import { TaskAnalyticsCard } from "@/components/task-analytics";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { useCreateTask, useDeleteTask, useTaskAnalytics, useTasks, useUpdateTask } from "@/hooks/use-tasks";

export default function CsrPage() {
  const tasksQuery = useTasks();
  const analyticsQuery = useTaskAnalytics();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold">CSR + React Query CRUD</h2>

      <TaskForm
        pending={createTask.isPending}
        onSubmit={async (payload) => {
          await createTask.mutateAsync(payload);
        }}
      />

      {tasksQuery.isLoading ? <p>Loading tasks...</p> : null}
      {tasksQuery.error ? <p>Failed loading tasks.</p> : null}
      {tasksQuery.data ? (
        <TaskList
          tasks={tasksQuery.data}
          onDelete={async (id) => deleteTask.mutateAsync(id)}
          onComplete={async (id) => updateTask.mutateAsync({ id, payload: { status: "done" } })}
        />
      ) : null}

      {analyticsQuery.data ? <TaskAnalyticsCard analytics={analyticsQuery.data} /> : null}
    </section>
  );
}
