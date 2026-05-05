import { Prisma } from "@/generated/prisma";

import { db } from "@/lib/db";
import type { CreateTaskInput, Task, TaskAnalytics, UpdateTaskInput } from "@/models/task";

function mapTask(row: {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: String(row.status) as Task["status"],
    priority: row.priority,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function initTaskTable() {
  // Prisma migrations manage schema; this keeps compatibility with existing call sites.
  await db.$queryRaw`SELECT 1`;
}

export async function listTasks(userId: number) {
  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }]
  });

  return tasks
    .sort((a: { status: Task["status"] }, b: { status: Task["status"] }) => {
      const rank: Record<Task["status"], number> = { in_progress: 1, todo: 2, done: 3 };
      return rank[a.status] - rank[b.status];
    })
    .map(mapTask);
}

export async function getTaskById(id: number, userId: number) {
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) return null;
  return mapTask(task);
}

export async function createTask(input: CreateTaskInput, userId: number) {
  const task = await db.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "todo",
      priority: input.priority ?? 3,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    }
  });

  return mapTask(task);
}

export async function updateTask(id: number, input: UpdateTaskInput, userId: number) {
  const existing = await db.task.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const task = await db.task.update({
    where: { id },
    data: {
      title: input.title ?? undefined,
      description: "description" in input ? input.description : undefined,
      status: input.status ?? undefined,
      priority: input.priority ?? undefined,
      dueDate: "dueDate" in input ? (input.dueDate ? new Date(input.dueDate) : null) : undefined
    }
  });

  return mapTask(task);
}

export async function deleteTask(id: number, userId: number) {
  const existing = await db.task.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await db.task.delete({ where: { id } });
  return true;
}

export async function getTaskAnalytics(userId: number): Promise<TaskAnalytics> {
  const result = await db.$queryRaw<
    Array<{
      total_tasks: number;
      done_tasks: number;
      overdue_tasks: number;
      top_priorities: Array<{ priority: number; count: number }>;
      recent_completed_titles: string[];
    }>
  >(Prisma.sql`
    WITH ranked_completed AS (
      SELECT
        title,
        ROW_NUMBER() OVER (ORDER BY updated_at DESC) AS rn
      FROM tasks
      WHERE status = 'done'
        AND user_id = ${userId}
    ),
    priority_stats AS (
      SELECT
        priority,
        COUNT(*)::INT AS count
      FROM tasks
      WHERE user_id = ${userId}
      GROUP BY priority
      ORDER BY priority DESC
    ),
    aggregates AS (
      SELECT
        COUNT(*)::INT AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'done')::INT AS done_tasks,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done')::INT AS overdue_tasks
      FROM tasks
      WHERE user_id = ${userId}
    )
    SELECT
      a.total_tasks,
      a.done_tasks,
      a.overdue_tasks,
      COALESCE(
        (SELECT json_agg(ps) FROM priority_stats ps),
        '[]'::json
      ) AS top_priorities,
      COALESCE(
        (SELECT json_agg(rc.title) FROM ranked_completed rc WHERE rc.rn <= 5),
        '[]'::json
      ) AS recent_completed_titles
    FROM aggregates a;
  `);

  const row = result[0];

  return {
    totalTasks: row.total_tasks,
    doneTasks: row.done_tasks,
    overdueTasks: row.overdue_tasks,
    topPriorities: row.top_priorities,
    recentCompletedTitles: row.recent_completed_titles
  };
}
