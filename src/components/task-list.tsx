"use client";

import type { Task } from "@/models/task";

type TaskListProps = {
  tasks: Task[];
  onDelete: (id: number) => Promise<unknown> | void;
  onComplete: (id: number) => Promise<unknown> | void;
};

export function TaskList({ tasks, onDelete, onComplete }: TaskListProps) {
  if (tasks.length === 0) return <p>No tasks yet.</p>;

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="rounded border p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-600">{task.description || "No description"}</p>
              <p className="text-xs text-gray-500">
                Status: {task.status} | Priority: {task.priority}
              </p>
            </div>
            <div className="flex gap-2">
              {task.status !== "done" ? (
                <button className="rounded border px-2 py-1" onClick={() => onComplete(task.id)}>
                  Complete
                </button>
              ) : null}
              <button className="rounded border px-2 py-1" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
