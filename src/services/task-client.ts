import type { CreateTaskInput, Task, TaskAnalytics, UpdateTaskInput } from "@/models/task";

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchTasks() {
  const res = await fetch("/api/tasks", { cache: "no-store" });
  return parseResponse<Task[]>(res);
}

export async function fetchTaskAnalytics() {
  const res = await fetch("/api/tasks?view=analytics", { cache: "no-store" });
  return parseResponse<TaskAnalytics>(res);
}

export async function createTaskRequest(payload: CreateTaskInput) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<Task>(res);
}

export async function updateTaskRequest(id: number, payload: UpdateTaskInput) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<Task>(res);
}

export async function deleteTaskRequest(id: number) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Delete failed");
  }
}
